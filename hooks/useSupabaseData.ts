import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert, PaperTrade, AutoTrade, AutoTraderSettings, TradeSide, TradeStatus, CloseReason, AutoTradeStatus } from '../types';
import { useAuth } from './useAuth';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>([]);
  const [autoTrades, setAutoTrades] = useState<AutoTrade[]>([]);
  const [autoTraderSettings, setAutoTraderSettings] = useState<AutoTraderSettings>({
    capital: 1000,
    riskPercent: 10,
    isActive: false,
  });
  const [loading, setLoading] = useState(true);

  // Load initial data when user logs in
  useEffect(() => {
    if (user) {
      loadAllData();
      setupRealtimeSubscriptions();
    } else {
      // Clear data when user logs out
      setAlerts([]);
      setPaperTrades([]);
      setAutoTrades([]);
      setAutoTraderSettings({ capital: 1000, riskPercent: 10, isActive: false });
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([
        loadAlerts(),
        loadPaperTrades(),
        loadAutoTrades(),
        loadAutoTraderSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading alerts:', error);
      return;
    }

    const formattedAlerts: Alert[] = data.map(alert => ({
      id: alert.id,
      symbol: alert.symbol,
      rsi: alert.rsi,
      price: alert.price,
      level: alert.level,
      createdAt: new Date(alert.created_at),
    }));

    setAlerts(formattedAlerts);
  };

  const loadPaperTrades = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('paper_trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading paper trades:', error);
      return;
    }

    const formattedTrades: PaperTrade[] = data.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side as TradeSide,
      entryPrice: trade.entry_price,
      tp: trade.tp,
      sl: trade.sl,
      qty: trade.qty,
      status: trade.status as TradeStatus,
      closePrice: trade.close_price,
      profit: trade.profit,
      reason: trade.close_reason as CloseReason,
      openedAt: new Date(trade.opened_at),
      closedAt: trade.closed_at ? new Date(trade.closed_at) : undefined,
    }));

    setPaperTrades(formattedTrades);
  };

  const loadAutoTrades = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('auto_trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading auto trades:', error);
      return;
    }

    const formattedTrades: AutoTrade[] = data.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      entryPrice: trade.entry_price,
      tp: trade.tp,
      sl: trade.sl,
      qty: trade.qty,
      investment: trade.investment,
      status: trade.status as AutoTradeStatus,
      closePrice: trade.close_price,
      profit: trade.profit,
      openedAt: new Date(trade.opened_at),
      closedAt: trade.closed_at ? new Date(trade.closed_at) : undefined,
    }));

    setAutoTrades(formattedTrades);
  };

  const loadAutoTraderSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('auto_trader_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading auto trader settings:', error);
      return;
    }

    if (data) {
      setAutoTraderSettings({
        capital: data.capital,
        riskPercent: data.risk_percent,
        isActive: data.is_active,
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Subscribe to alerts changes
    const alertsSubscription = supabase
      .channel('alerts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'alerts', filter: `user_id=eq.${user.id}` },
        () => loadAlerts()
      )
      .subscribe();

    // Subscribe to paper trades changes
    const paperTradesSubscription = supabase
      .channel('paper_trades_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'paper_trades', filter: `user_id=eq.${user.id}` },
        () => loadPaperTrades()
      )
      .subscribe();

    // Subscribe to auto trades changes
    const autoTradesSubscription = supabase
      .channel('auto_trades_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'auto_trades', filter: `user_id=eq.${user.id}` },
        () => loadAutoTrades()
      )
      .subscribe();

    // Subscribe to auto trader settings changes
    const settingsSubscription = supabase
      .channel('auto_trader_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'auto_trader_settings', filter: `user_id=eq.${user.id}` },
        () => loadAutoTraderSettings()
      )
      .subscribe();

    return () => {
      alertsSubscription.unsubscribe();
      paperTradesSubscription.unsubscribe();
      autoTradesSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
    };
  };

  // CRUD operations
  const saveAlert = async (alert: Omit<Alert, 'id' | 'createdAt'>, timeframe: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        symbol: alert.symbol,
        rsi: alert.rsi,
        price: alert.price,
        level: alert.level,
        timeframe,
      });

    if (error) {
      console.error('Error saving alert:', error);
    }
  };

  const savePaperTrade = async (trade: Omit<PaperTrade, 'id'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('paper_trades')
      .insert({
        user_id: user.id,
        symbol: trade.symbol,
        side: trade.side,
        entry_price: trade.entryPrice,
        tp: trade.tp,
        sl: trade.sl,
        qty: trade.qty,
        status: trade.status,
        close_price: trade.closePrice,
        profit: trade.profit,
        close_reason: trade.reason,
        opened_at: trade.openedAt.toISOString(),
        closed_at: trade.closedAt?.toISOString(),
      });

    if (error) {
      console.error('Error saving paper trade:', error);
    }
  };

  const updatePaperTrade = async (tradeId: string, updates: Partial<PaperTrade>) => {
    if (!user) return;

    const { error } = await supabase
      .from('paper_trades')
      .update({
        status: updates.status,
        close_price: updates.closePrice,
        profit: updates.profit,
        close_reason: updates.reason,
        closed_at: updates.closedAt?.toISOString(),
      })
      .eq('id', tradeId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating paper trade:', error);
    }
  };

  const saveAutoTrade = async (trade: Omit<AutoTrade, 'id'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('auto_trades')
      .insert({
        user_id: user.id,
        symbol: trade.symbol,
        entry_price: trade.entryPrice,
        tp: trade.tp,
        sl: trade.sl,
        qty: trade.qty,
        investment: trade.investment,
        status: trade.status,
        close_price: trade.closePrice,
        profit: trade.profit,
        opened_at: trade.openedAt.toISOString(),
        closed_at: trade.closedAt?.toISOString(),
      });

    if (error) {
      console.error('Error saving auto trade:', error);
    }
  };

  const updateAutoTrade = async (tradeId: string, updates: Partial<AutoTrade>) => {
    if (!user) return;

    const { error } = await supabase
      .from('auto_trades')
      .update({
        status: updates.status,
        close_price: updates.closePrice,
        profit: updates.profit,
        closed_at: updates.closedAt?.toISOString(),
      })
      .eq('id', tradeId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating auto trade:', error);
    }
  };

  const saveAutoTraderSettings = async (settings: AutoTraderSettings) => {
    if (!user) return;

    const { error } = await supabase
      .from('auto_trader_settings')
      .upsert({
        user_id: user.id,
        capital: settings.capital,
        current_capital: settings.capital, // Reset current capital when settings change
        risk_percent: settings.riskPercent,
        is_active: settings.isActive,
      });

    if (error) {
      console.error('Error saving auto trader settings:', error);
    }
  };

  const updateCurrentCapital = async (newCapital: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('auto_trader_settings')
      .update({ current_capital: newCapital })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating current capital:', error);
    }
  };

  return {
    alerts,
    paperTrades,
    autoTrades,
    autoTraderSettings,
    loading,
    saveAlert,
    savePaperTrade,
    updatePaperTrade,
    saveAutoTrade,
    updateAutoTrade,
    saveAutoTraderSettings,
    updateCurrentCapital,
  };
};