import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert, PaperTrade, TradeStatus, TradeSide, CloseReason } from '../types';

export const useSupabaseData = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if Supabase is properly configured
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('rsi_alerts').select('count').limit(1);
        if (!error) {
          setIsConnected(true);
        }
      } catch (err) {
        console.log('Supabase not connected yet');
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  const saveAlert = async (alert: Alert, timeframe: string): Promise<string | null> => {
    if (!isConnected) return null;

    try {
      if (!supabase) {
        console.warn('Supabase not configured. Alert not saved.');
        return null;
      }

      const { data, error } = await supabase
        .from('rsi_alerts')
        .insert({
          symbol: alert.symbol,
          rsi: alert.rsi,
          price: alert.price,
          level: alert.level,
          timeframe: timeframe,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving alert:', error);
        return null;
      }

      return data.id;
    } catch (err) {
      console.error('Error saving alert:', err);
      return null;
    }
  };

  const saveTrade = async (trade: PaperTrade, alertId?: string): Promise<boolean> => {
    if (!isConnected) return false;

    try {
      if (!supabase) {
      }

      const { error } = await supabase
        .from('paper_trades')
        .insert({
          id: trade.id,
          symbol: trade.symbol,
          side: trade.side,
          entry_price: trade.entryPrice,
          tp: trade.tp,
          sl: trade.sl,
          qty: trade.qty,
          status: trade.status,
          opened_at: trade.openedAt.toISOString(),
          closed_at: trade.closedAt?.toISOString() || null,
          close_price: trade.closePrice || null,
          profit: trade.profit || null,
          reason: trade.reason || null,
          alert_id: alertId || null,
        });

      if (error) {
        console.error('Error saving trade:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error saving trade:', err);
      return false;
    }
  };

  const updateTrade = async (trade: PaperTrade): Promise<boolean> => {
    if (!isConnected || !supabase) return false;

    try {
      const { error } = await supabase
        .from('paper_trades')
        .update({
          status: trade.status,
          closed_at: trade.closedAt?.toISOString() || null,
          close_price: trade.closePrice || null,
          profit: trade.profit || null,
          reason: trade.reason || null,
        })
        .eq('id', trade.id);

      if (error) {
        console.error('Error updating trade:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error updating trade:', err);
      return false;
    }
  };

  const loadTrades = async (): Promise<PaperTrade[]> => {
    if (!isConnected || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('paper_trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading trades:', error);
        return [];
      }

      if (!data) return [];

      if (!data) return [];

      return data.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        side: trade.side as TradeSide,
        entryPrice: trade.entry_price,
        tp: trade.tp,
        sl: trade.sl,
        qty: trade.qty,
        status: trade.status as TradeStatus,
        openedAt: new Date(trade.opened_at),
        closedAt: trade.closed_at ? new Date(trade.closed_at) : undefined,
        closePrice: trade.close_price || undefined,
        profit: trade.profit || undefined,
        reason: trade.reason as CloseReason || undefined,
      }));
    } catch (err) {
      console.error('Error loading trades:', err);
      return [];
    }
  };

  const loadAlerts = async (limit: number = 100): Promise<Alert[]> => {
    if (!isConnected || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('rsi_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error loading alerts:', error);
        return [];
      }

      return data.map(alert => ({
        id: alert.id,
        symbol: alert.symbol,
        rsi: alert.rsi,
        price: alert.price,
        level: alert.level,
        createdAt: new Date(alert.created_at),
      }));
    } catch (err) {
      console.error('Error loading alerts:', err);
      return [];
    }
  };

  return {
    isConnected,
    saveAlert,
    saveTrade,
    updateTrade,
    loadTrades,
    loadAlerts,
  };
};