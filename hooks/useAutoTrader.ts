import { useState, useEffect, useRef, useMemo } from 'react';
import { MarketData } from './useBinanceTradingData';
import { AutoTraderSettings, AutoTrade, AutoTradeStatus } from '../types';

const RSI_TRIGGER_THRESHOLD = 25;
const RSI_RESET_THRESHOLD = 40;
const TP_PERCENT = 1.02; // 2% Take Profit
const SL_PERCENT = 0.99; // 1% Stop Loss

export const useAutoTrader = (marketData: MarketData[]) => {
  const [settings, setSettings] = useState<AutoTraderSettings>({
    capital: 1000,
    riskPercent: 10,
    isActive: false,
  });
  const [autoTrades, setAutoTrades] = useState<AutoTrade[]>([]);
  const [currentCapital, setCurrentCapital] = useState(settings.capital);
  const tradeTriggerState = useRef<Map<string, 'triggered' | 'idle'>>(new Map());

  // Reset capital when settings change
  useEffect(() => {
    setCurrentCapital(settings.capital);
    // Optionally reset trades as well if desired
    // setAutoTrades([]); 
  }, [settings.capital]);

  // Core Trade Logic: Entry and Monitoring
  useEffect(() => {
    if (!settings.isActive || marketData.length === 0) return;

    const tradesToUpdate: AutoTrade[] = [];
    const openOrMissedTrades = autoTrades.filter(t => t.status === AutoTradeStatus.OPEN || t.status === AutoTradeStatus.MISSED);

    marketData.forEach(data => {
      const { symbol, price, rsi } = data;
      if (price === 0 || rsi === null) return;

      const triggerState = tradeTriggerState.current.get(symbol) || 'idle';

      // --- Reset trigger state if RSI recovers ---
      if (triggerState === 'triggered' && rsi > RSI_RESET_THRESHOLD) {
        tradeTriggerState.current.set(symbol, 'idle');
      }

      // --- New trade entry logic ---
      if (triggerState === 'idle' && rsi <= RSI_TRIGGER_THRESHOLD) {
        tradeTriggerState.current.set(symbol, 'triggered');
        
        const investment = currentCapital * (settings.riskPercent / 100);
        
        const newTrade: Omit<AutoTrade, 'id'> = {
            symbol,
            entryPrice: price,
            tp: price * TP_PERCENT,
            sl: price * SL_PERCENT,
            openedAt: new Date(),
            qty: 0,
            investment: 0,
            status: AutoTradeStatus.OPEN,
        };

        if (currentCapital > 0) {
            const actualInvestment = Math.min(investment, currentCapital);
            newTrade.investment = actualInvestment;
            newTrade.qty = actualInvestment / price;
            setCurrentCapital(prev => prev - actualInvestment);
        } else {
            newTrade.status = AutoTradeStatus.MISSED;
        }

        setAutoTrades(prev => [...prev, { ...newTrade, id: `${symbol}-${Date.now()}` }]);
      }

      // --- Monitor existing open/missed trades for this symbol ---
      openOrMissedTrades.forEach(trade => {
        if (trade.symbol === symbol) {
            let closeReason: 'TP' | 'SL' | null = null;
            if (price >= trade.tp) closeReason = 'TP';
            if (price <= trade.sl) closeReason = 'SL';

            if (closeReason) {
                const profit = (price - trade.entryPrice) * trade.qty;
                const updatedTrade: AutoTrade = {
                    ...trade,
                    status: closeReason === 'TP' ? AutoTradeStatus.TP_HIT : AutoTradeStatus.SL_HIT,
                    closedAt: new Date(),
                    closePrice: price,
                    profit,
                };

                // If it was a real trade, add proceeds back to capital
                if (trade.status === AutoTradeStatus.OPEN) {
                    setCurrentCapital(prev => prev + trade.investment + profit);
                }
                
                tradesToUpdate.push(updatedTrade);
            }
        }
      });
    });

    if (tradesToUpdate.length > 0) {
        setAutoTrades(prevTrades => 
            prevTrades.map(pt => tradesToUpdate.find(ut => ut.id === pt.id) || pt)
        );
    }

  }, [marketData, settings.isActive]);


  const portfolioStats = useMemo(() => {
    const closedTrades = autoTrades.filter(t => t.status === AutoTradeStatus.TP_HIT || t.status === AutoTradeStatus.SL_HIT);
    const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
    const wins = closedTrades.filter(t => t.status === AutoTradeStatus.TP_HIT).length;
    const losses = closedTrades.length - wins;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
    
    return {
        initialCapital: settings.capital,
        currentCapital,
        totalPnl,
        winRate,
        wins,
        losses,
    };
  }, [autoTrades, currentCapital, settings.capital]);


  return { settings, setSettings, autoTrades, portfolioStats };
};
