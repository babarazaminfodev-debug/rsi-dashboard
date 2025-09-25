import { useState, useEffect, useRef } from 'react';
import { calculateRSI } from '../utils/rsi';
import { Alert } from '../types';
import { sendTelegramMessage } from '../utils/telegram';
import { SYMBOLS } from '../constants';

const RSI_PERIOD = 14;
const OVERSOLD_THRESHOLD = 30;
const OVERBOUGHT_THRESHOLD = 70;
const PRICE_HISTORY_LIMIT = 100;
const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes for UI alerts

// Telegram specific thresholds
const RSI_WARNING_THRESHOLD = 30;
const RSI_BUY_THRESHOLD = 25;
const RSI_RESET_THRESHOLD = 40;


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
  const lastAlertTimestamps = useRef<Map<string, number>>(new Map());
  const telegramAlertState = useRef<Map<string, 'warned' | 'triggered'>>(new Map());
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    setLoading(true);
    priceHistories.current.clear();
    telegramAlertState.current.clear();
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

          const history = priceHistories.current.get(symbol);
          if (history && history.length > RSI_PERIOD) {
            const liveHistory = [...history.slice(0, -1), price];
            const liveRsi = calculateRSI(liveHistory, RSI_PERIOD);
            setMarketData(prev => prev.map(item => item.symbol === symbol ? { ...item, rsi: liveRsi } : item));
          }

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
                // --- Refactored Telegram Alert Logic ---
                const currentState = telegramAlertState.current.get(symbol);

                // 1. State Reset Logic: If RSI has recovered, reset the alert state for this symbol.
                if (currentState && rsi > RSI_RESET_THRESHOLD) {
                    telegramAlertState.current.delete(symbol);
                } 
                // 2. Alert Trigger Logic: Only check for new alerts if RSI is below the warning threshold.
                else if (rsi <= RSI_WARNING_THRESHOLD) {
                    // Send BUY SIGNAL only if the state is currently 'warned' and RSI drops further.
                    if (rsi <= RSI_BUY_THRESHOLD && currentState === 'warned') {
                        const entryPrice = closePrice;
                        const tp = entryPrice * 1.02;
                        const sl = entryPrice * 0.99;
                        const message = `🟢 *BUY SIGNAL* 🟢\n\n*Symbol:* ${symbol}\n*Entry Price:* ${entryPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}\n*TP:* ${tp.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} (+2%)\n*SL:* ${sl.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} (-1%)`;
                        sendTelegramMessage(message);
                        telegramAlertState.current.set(symbol, 'triggered');
                    }
                    // Send WARNING signal only if there is no current state (i.e., it's the first time crossing).
                    else if (!currentState) {
                        const message = `⚠️ *RSI WARNING* ⚠️\n\n*Symbol:* ${symbol}\n*Price:* ${closePrice.toLocaleString()}\n*RSI:* ${rsi.toFixed(2)}`;
                        sendTelegramMessage(message);
                        telegramAlertState.current.set(symbol, 'warned');
                    }
                }

                // --- UI Alert Logic (remains unchanged) ---
                const now = Date.now();
                const alertKey = `${symbol}-${rsi <= OVERSOLD_THRESHOLD ? 'oversold' : 'overbought'}`;
                const lastAlertTime = lastAlertTimestamps.current.get(alertKey) || 0;
                
                if (now - lastAlertTime > ALERT_COOLDOWN) {
                  let alertConditionMet = false;
                  let level = 0;
                  if (rsi <= OVERSOLD_THRESHOLD) {
                    alertConditionMet = true;
                    level = OVERSOLD_THRESHOLD;
                  } else if (rsi >= OVERBOUGHT_THRESHOLD) {
                    alertConditionMet = true;
                    level = OVERBOUGHT_THRESHOLD;
                  }
                  
                  if (alertConditionMet) {
                      const newAlert: Alert = {
                          id: `${symbol}-${now}`,
                          symbol, rsi, price: closePrice, level,
                          createdAt: new Date(),
                      };
                      setAlerts(prev => [newAlert, ...prev].slice(0, 50));
                      lastAlertTimestamps.current.set(alertKey, now);
                  }
                }
              }
          }
        }
      };

      newWs.onerror = (error) => {
        console.error('Binance WebSocket error. For details, check the browser\'s developer console network tab.');
        setLoading(false);
      };

      newWs.onclose = (event) => {
        // A close code of 1000 is a "Normal Closure" meaning the connection was closed intentionally.
        // We only want to attempt reconnection on unexpected closures.
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

  return { marketData, alerts, loading };
};
