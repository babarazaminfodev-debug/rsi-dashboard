import { useState, useEffect, useRef, useMemo } from 'react';
import { MarketData } from './useBinanceTradingData';
import { AutoTraderSettings, AutoTrade, AutoTradeStatus } from '../types';
import { useSupabaseData } from './useSupabaseData';

const RSI_TRIGGER_THRESHOLD = 25;
const RSI_RESET_THRESHOLD = 40;
const TP_PERCENT = 1.02; // 2% Take Profit
const SL_PERCENT = 0.99; // 1% Stop Loss

export const useSupabaseAutoTrader = (marketData: MarketData[], addToast?: (message: string, type?: 'success' | 'error' | 'info') => void) => {
  const { 
    autoTrades, 
    autoTraderSettings, 
    saveAutoTrade, 
    updateAutoTrade, 
    saveAutoTraderSettings,
    updateCurrentCapital 
  } = useSupabaseData();
  
  const [currentCapital, setCurrentCapital] = useState(autoTraderSettings.capital);
  const tradeTriggerState = useRef<Map<string, 'triggered' | 'idle'>>(new Map());

  // Update current capital when settings change
  useEffect(() => {
    setCurrentCapital(autoTraderSettings.capital);
  }, [autoTraderSettings.capital]);

  const handleSettingsChange = async (newSettings: AutoTraderSettings) => {
    await saveAutoTraderSettings(newSettings);
    if (newSettings.capital !== autoTraderSettings.capital) {
      setCurrentCapital(newSettings.capital);
      await updateCurrentCapital(newSettings.capital);
    }
  };

  // Core Trade Logic: Entry and Monitoring
  useEffect(() => {
    if (!autoTraderSettings.isActive || marketData.length === 0) return;

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
        
        const investment = currentCapital * (autoTraderSettings.riskPercent / 100);
        
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
            const newCapital = currentCapital - actualInvestment;
            setCurrentCapital(newCapital);
            updateCurrentCapital(newCapital);
        } else {
            newTrade.status = AutoTradeStatus.MISSED;
        }

        saveAutoTrade(newTrade);
        
        if (addToast) {
          if (newTrade.status === AutoTradeStatus.OPEN) {
            addToast(`Auto-trade opened: ${symbol} at ${price.toLocaleString()}`, 'info');
          } else {
            addToast(`Auto-trade missed: ${symbol} (insufficient capital)`, 'error');
          }
        }
      }

      // --- Monitor existing open/missed trades for this symbol ---
      openOrMissedTrades.forEach(trade => {
        if (trade.symbol === symbol) {
            let closeReason: 'TP' | 'SL' | null = null;
            if (price >= trade.tp) closeReason = 'TP';
            if (price <= trade.sl) closeReason = 'SL';

            if (closeReason) {
                const profit = (price - trade.entryPrice) * trade.qty;
                const updatedTrade = {
                    status: closeReason === 'TP' ? AutoTradeStatus.TP_HIT : AutoTradeStatus.SL_HIT,
                    closedAt: new Date(),
                    closePrice: price,
                    profit,
                };

                // If it was a real trade, add proceeds back to capital
                if (trade.status === AutoTradeStatus.OPEN) {
                    const newCapital = currentCapital + trade.investment + profit;
                    setCurrentCapital(newCapital);
                    updateCurrentCapital(newCapital);
                }
                
                updateAutoTrade(trade.id, updatedTrade);
                
                if (addToast && trade.status === AutoTradeStatus.OPEN) {
                  const isProfit = profit > 0;
                  const message = `Auto-trade closed: ${symbol} ${isProfit ? '+' : ''}$${profit.toFixed(2)} (${closeReason})`;
                  addToast(message, isProfit ? 'success' : 'error');
                }
            }
        }
      });
    });

  }, [marketData, autoTraderSettings.isActive, autoTrades, currentCapital, addToast]);

  const portfolioStats = useMemo(() => {
    const closedTrades = autoTrades.filter(t => t.status === AutoTradeStatus.TP_HIT || t.status === AutoTradeStatus.SL_HIT);
    const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
    const wins = closedTrades.filter(t => t.status === AutoTradeStatus.TP_HIT).length;
    const losses = closedTrades.length - wins;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
    
    return {
        initialCapital: autoTraderSettings.capital,
        currentCapital,
        totalPnl,
        winRate,
        wins,
        losses,
    };
  }, [autoTrades, currentCapital, autoTraderSettings.capital]);

  return { 
    settings: autoTraderSettings, 
    setSettings: handleSettingsChange, 
    autoTrades, 
    portfolioStats 
  };
};