import { useState, useEffect, useMemo, useCallback } from 'react';
import { MarketData } from './useBinanceTradingData';
import { AutoTraderSettings, AutoTrade, AutoTradeStatus, Deposit } from '../types';
import { usePersistentState } from './usePersistentState';

const RSI_TRIGGER_THRESHOLD = 25;
const RSI_RESET_THRESHOLD = 35;
const TP_PERCENT = 1.02; // 2% Take Profit
const SL_PERCENT = 0.99; // 1% Stop Loss

export const useAutoTrader = (marketData: MarketData[]) => {
  const [settings, setSettings] = usePersistentState<AutoTraderSettings>('autoTraderSettings', {
    capital: 1000,
    riskPercent: 10,
    isActive: false,
  });
  
  const [autoTrades, setAutoTrades] = usePersistentState<AutoTrade[]>('autoTraderTrades', []);
  const [deposits, setDeposits] = usePersistentState<Deposit[]>('autoTraderDeposits', []);

  const tradeTriggerState = useState<Map<string, 'triggered' | 'idle'>>(new Map())[0];

  const initialCapital = useMemo(() => {
    return deposits.reduce((acc, d) => acc + d.amount, 0);
  }, [deposits]);

  const currentCapital = useMemo(() => {
      const openInvestments = autoTrades
        .filter(t => t.status === AutoTradeStatus.OPEN)
        .reduce((acc, trade) => acc + trade.investment, 0);
      
      const closedPnl = autoTrades
        .filter(t => t.status === AutoTradeStatus.TP_HIT || t.status === AutoTradeStatus.SL_HIT)
        .reduce((acc, trade) => acc + (trade.profit || 0), 0);

      return initialCapital + closedPnl - openInvestments;
  }, [autoTrades, initialCapital]);


  const addDeposit = useCallback((amount: number) => {
    if (amount > 0) {
      const newDeposit: Deposit = {
        id: `dep-${Date.now()}`,
        amount,
        date: new Date(),
      };
      setDeposits(prev => [...prev, newDeposit]);
    }
  }, [setDeposits]);

  // Core Trade Logic: Entry and Monitoring
  useEffect(() => {
    if (!settings.isActive || marketData.length === 0) return;

    const openTrades = autoTrades.filter(t => t.status === AutoTradeStatus.OPEN);
    const tradesToUpdate: AutoTrade[] = [];
    const newTrades: AutoTrade[] = [];

    marketData.forEach(data => {
      const { symbol, price, rsi } = data;
      if (price === 0 || rsi === null) return;

      const triggerState = tradeTriggerState.get(symbol) || 'idle';

      // --- Reset trigger state if RSI recovers ---
      if (triggerState === 'triggered' && rsi > RSI_RESET_THRESHOLD) {
        tradeTriggerState.set(symbol, 'idle');
      }

      // --- New trade entry logic ---
      if (triggerState === 'idle' && rsi <= RSI_TRIGGER_THRESHOLD) {
        tradeTriggerState.set(symbol, 'triggered');
        
        const investment = settings.capital * (settings.riskPercent / 100);
        
        const baseNewTrade: Omit<AutoTrade, 'id'> = {
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
            baseNewTrade.investment = actualInvestment;
            baseNewTrade.qty = actualInvestment / price;
        } else {
            baseNewTrade.status = AutoTradeStatus.MISSED;
        }

        newTrades.push({ ...baseNewTrade, id: `${symbol}-${Date.now()}` });
      }

      // --- Monitor existing open trades for this symbol ---
      openTrades.forEach(trade => {
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
                tradesToUpdate.push(updatedTrade);
            }
        }
      });
    });

    if (newTrades.length > 0 || tradesToUpdate.length > 0) {
        setAutoTrades(prevTrades => {
            const updated = prevTrades.map(pt => tradesToUpdate.find(ut => ut.id === pt.id) || pt);
            return [...updated, ...newTrades];
        });
    }

  }, [marketData, settings.isActive, settings.capital, settings.riskPercent, autoTrades, currentCapital, setAutoTrades, tradeTriggerState]);


  const portfolioStats = useMemo(() => {
    const closedTrades = autoTrades.filter(t => t.status === AutoTradeStatus.TP_HIT || t.status === AutoTradeStatus.SL_HIT);
    const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
    const wins = closedTrades.filter(t => t.status === AutoTradeStatus.TP_HIT).length;
    const losses = closedTrades.length - wins;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
    
    return {
        initialCapital,
        currentCapital,
        totalPnl,
        winRate,
        wins,
        losses,
    };
  }, [autoTrades, currentCapital, initialCapital]);
  
  const capitalAllocation = useMemo(() => {
      const openTrades = autoTrades.filter(t => t.status === AutoTradeStatus.OPEN);
      const invested = openTrades.reduce((acc, trade) => {
        if (!acc[trade.symbol]) {
            acc[trade.symbol] = 0;
        }
        acc[trade.symbol] += trade.investment;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        invested,
        available: currentCapital,
        total: currentCapital + Object.values(invested).reduce((sum, val) => sum + val, 0)
      }

  }, [autoTrades, currentCapital]);


  return { settings, setSettings, autoTrades, portfolioStats, addDeposit, deposits, capitalAllocation };
};
