import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase first.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      rsi_alerts: {
        Row: {
          id: string;
          symbol: string;
          rsi: number;
          price: number;
          level: number;
          timeframe: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          rsi: number;
          price: number;
          level: number;
          timeframe?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          rsi?: number;
          price?: number;
          level?: number;
          timeframe?: string;
          created_at?: string;
        };
      };
      paper_trades: {
        Row: {
          id: string;
          symbol: string;
          side: 'BUY' | 'SELL';
          entry_price: number;
          tp: number;
          sl: number;
          qty: number;
          status: 'OPEN' | 'CLOSED';
          opened_at: string;
          closed_at: string | null;
          close_price: number | null;
          profit: number | null;
          reason: 'TP' | 'SL' | 'MANUAL' | null;
          alert_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          side: 'BUY' | 'SELL';
          entry_price: number;
          tp: number;
          sl: number;
          qty: number;
          status?: 'OPEN' | 'CLOSED';
          opened_at: string;
          closed_at?: string | null;
          close_price?: number | null;
          profit?: number | null;
          reason?: 'TP' | 'SL' | 'MANUAL' | null;
          alert_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          side?: 'BUY' | 'SELL';
          entry_price?: number;
          tp?: number;
          sl?: number;
          qty?: number;
          status?: 'OPEN' | 'CLOSED';
          opened_at?: string;
          closed_at?: string | null;
          close_price?: number | null;
          profit?: number | null;
          reason?: 'TP' | 'SL' | 'MANUAL' | null;
          alert_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}