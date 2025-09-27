import { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
import { calculateRSI } from '@/utils/rsi';
import { Alert } from '@/types';
import { sendTelegramMessage } from '@/utils/telegram';
import { SYMBOLS } from '@/constants';
=======
import { calculateRSI } from '../utils/rsi';
import { Alert } from '../types';
import { sendTelegramMessage } from '../utils/telegram';
import { SYMBOLS } from '../constants';
>>>>>>> d9c53f4d6f536b217011ed3d8fb53d695764ac21

const RSI_PERIOD = 14;
const PRICE_HISTORY_LIMIT = 100;
const ALERT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// --- Alert & Telegram Thresholds ---
const RSI_LEVEL_30 = 30; // UI Alert & Telegram Warning
const RSI_LEVEL_25 = 25; // UI Alert & Telegram Signal

const RESET_THRESHOLD_FOR_LEVEL_30 = 40;
const RESET_THRESHOLD_FOR_LEVEL_25 = 35;


export interface MarketData {
  symbol: string;
  price: number;
  rsi: number | null;
}

export const useBinanceTradingData = (timeframe: string) => {
  const [marketData, setMarketData] = useState<MarketData[]>(SYMBOLS.map(symbol => ({ symbol, price: 0, rsi: null })));
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  
  const priceHistories = useRef<Map<string, number[]>>(new Map());
  const activeAlerts = useRef<Map<string, Alert>>(new Map());
  const telegramAlertState = useRef<Map<string, 'warned' | 'triggered'>>(new Map());
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    setLoading(true);
    priceHistories.current.clear();
    activeAlerts.current.clear();
    telegramAlertState.current.clear();
    setAlerts([]);
    setMarketData(SYMBOLS.map(symbol => ({ symbol, price: 0, rsi: null })));

    if (ws.current) {
      ws.current.close(1000, "Timeframe changed");
      ws.current = null;
    }
    
    const fetchInitialData = async () => {
      await Promise.all(SYMBOLS.map(async (symbol) => {
        try {
          const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=${PRICE_HISTORY_LIMIT}`);
          if (!response.ok) throw new Error(`Failed to fetch klines for ${symbol}`);
          
          const klines = await response.json();
          const closingPrices: number[] = klines.map((k: any) => parseFloat(k[4]));
          
          priceHistories.current.set(symbol, closingPrices);
          
          const rsi = calculateRSI(closingPrices, RSI_PERIOD);
          const currentPrice = closingPrices.length > 0 ? closingPrices[closingPrices.length - 1] : 0;
          
          setMarketData(prev => prev.map(item => item.symbol === symbol ? { symbol, price: currentPrice, rsi } : item));

        } catch (error) {
          console.error(error);
          setMarketData(prev => prev.map(item => item.symbol === symbol ? { symbol, price: 0, rsi: null } : item));
        }
      }));
      connectWebSocket();
    };

    const connectWebSocket = () => {
      const klineStreams = SYMBOLS.map(s => `${s.toLowerCase()}@kline_${timeframe}`);
      const tickerStreams = SYMBOLS.map(s => `${s.toLowerCase()}@miniTicker`);
      const streams = [...klineStreams, ...tickerStreams].join('/');
      
      const newWs = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      ws.current = newWs;

      newWs.onopen = () => {
        console.log('Binance dual-stream WebSocket connected');
        setLoading(false);
      };

      newWs.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const { stream, data } = message;
        
        if (!data) return;

        if (stream.endsWith('@miniTicker')) {
          const symbol = data.s;
          const price = parseFloat(data.c);
          setMarketData(prev => prev.map(item => item.symbol === symbol ? { ...item, price } : item));
        } else if (stream.endsWith(`@kline_${timeframe}`)) {
          const symbol = data.s;
          const kline = data.k;
          const isKlineClosed = kline.x;

          if (isKlineClosed) {
              const closePrice = parseFloat(kline.c);
              const history = priceHistories.current.get(symbol) || [];
              const newHistory = [...history.slice(1), closePrice];
              priceHistories.current.set(symbol, newHistory);

              const rsi = calculateRSI(newHistory, RSI_PERIOD);
              setMarketData(prev => prev.map(item => item.symbol === symbol ? { ...item, price: closePrice, rsi } : item));

              if (rsi !== null) {
                const activeAlert = activeAlerts.current.get(symbol);

                // --- Mark alerts as resettable if RSI recovers ---
                if (activeAlert) {
                  if (activeAlert.level === RSI_LEVEL_30 && rsi > RESET_THRESHOLD_FOR_LEVEL_30) {
                    activeAlert.isReset = true;
                  }
                  if (activeAlert.level === RSI_LEVEL_25 && rsi > RESET_THRESHOLD_FOR_LEVEL_25) {
                    activeAlert.isReset = true;
                  }
                }

                // --- Telegram Alert State Reset Logic ---
                const tgState = telegramAlertState.current.get(symbol);
                if (tgState === 'triggered' && rsi > RESET_THRESHOLD_FOR_LEVEL_25) {
                    telegramAlertState.current.delete(symbol);
                } else if (tgState === 'warned' && rsi > RESET_THRESHOLD_FOR_LEVEL_30) {
                     telegramAlertState.current.delete(symbol);
                }
                
                // --- Alert Trigger & Aggregation Logic ---
                let levelToTrigger: number | null = null;
                if (rsi <= RSI_LEVEL_25) levelToTrigger = RSI_LEVEL_25;
                else if (rsi <= RSI_LEVEL_30) levelToTrigger = RSI_LEVEL_30;

                if (levelToTrigger) {
                    const now = new Date();
                    // If no active alert, or if it's a new sequence (isReset), or a stronger alert (30 -> 25)
                    if (!activeAlert || activeAlert.isReset || levelToTrigger < activeAlert.level) {
                        const newAlert: Alert = {
                            id: `${symbol}-${levelToTrigger}-${now.getTime()}`,
                            symbol, rsi, price: closePrice, level: levelToTrigger,
                            createdAt: now, lastTriggeredAt: now,
                            count: 1, isReset: false,
                        };
                        activeAlerts.current.set(symbol, newAlert);
                    } else if (activeAlert.level === levelToTrigger && !activeAlert.isReset) {
                        // Aggregate existing alert
                        activeAlert.count += 1;
                        activeAlert.lastTriggeredAt = now;
                        activeAlert.rsi = rsi;
                        activeAlert.price = closePrice;
                    }
                }
                
                // --- Telegram Message Logic ---
                if (rsi <= RSI_LEVEL_25 && telegramAlertState.current.get(symbol) !== 'triggered') {
                    const message = `🟢 *BUY SIGNAL* 🟢\n\n*Symbol:* ${symbol}\n*Price:* ${closePrice.toLocaleString(undefined, { minimumFractionDigits: 4 })}\n*RSI:* ${rsi.toFixed(2)}`;
                    sendTelegramMessage(message);
                    telegramAlertState.current.set(symbol, 'triggered');
                } else if (rsi <= RSI_LEVEL_30 && !telegramAlertState.current.has(symbol)) {
                    const message = `⚠️ *RSI WARNING* ⚠️\n\n*Symbol:* ${symbol}\n*Price:* ${closePrice.toLocaleString()}\n*RSI:* ${rsi.toFixed(2)}`;
                    sendTelegramMessage(message);
                    telegramAlertState.current.set(symbol, 'warned');
                }
                
                // Update state with current alerts, filtering out expired ones
                const nowMs = Date.now();
                const freshAlerts = Array.from(activeAlerts.current.values())
                    .filter(alert => (nowMs - alert.createdAt.getTime()) < ALERT_EXPIRATION_MS);
                
                setAlerts(freshAlerts);
              }
          }
        }
      };

      newWs.onerror = (error) => {
        console.error('Binance WebSocket error. For details, check the browser\'s developer console network tab.');
        setLoading(false);
      };

      newWs.onclose = (event) => {
        if (event.code !== 1000) {
          console.warn(`Binance WebSocket disconnected unexpectedly (Code: ${event.code}). Attempting to reconnect...`);
          setTimeout(connectWebSocket, 5000);
        } else {
          console.log("Binance WebSocket closed cleanly.");
        }
      };
    };

    fetchInitialData();

    return () => {
      if (ws.current) {
        ws.current.close(1000, "Component unmounting");
        ws.current = null;
      }
    };
  }, [timeframe]);
  
  const sortedAlerts = alerts.sort((a,b) => b.lastTriggeredAt.getTime() - a.lastTriggeredAt.getTime());
  const alertsRsi30 = sortedAlerts.filter(a => a.level > RSI_LEVEL_25 && a.level <= RSI_LEVEL_30);
  const alertsRsi25 = sortedAlerts.filter(a => a.level <= RSI_LEVEL_25);

  return { marketData, alertsRsi30, alertsRsi25, loading };
<<<<<<< HEAD
};
=======
};
>>>>>>> d9c53f4d6f536b217011ed3d8fb53d695764ac21
