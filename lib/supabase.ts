import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          rsi: number;
          price: number;
          level: number;
          timeframe: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          rsi: number;
          price: number;
          level: number;
          timeframe?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
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
          user_id: string;
          symbol: string;
          side: 'BUY' | 'SELL';
          entry_price: number;
          tp: number;
          sl: number;
          qty: number;
          status: 'OPEN' | 'CLOSED';
          close_price: number | null;
          profit: number | null;
          close_reason: 'TP' | 'SL' | 'MANUAL' | null;
          opened_at: string;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          side: 'BUY' | 'SELL';
          entry_price: number;
          tp: number;
          sl: number;
          qty: number;
          status?: 'OPEN' | 'CLOSED';
          close_price?: number | null;
          profit?: number | null;
          close_reason?: 'TP' | 'SL' | 'MANUAL' | null;
          opened_at?: string;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          side?: 'BUY' | 'SELL';
          entry_price?: number;
          tp?: number;
          sl?: number;
          qty?: number;
          status?: 'OPEN' | 'CLOSED';
          close_price?: number | null;
          profit?: number | null;
          close_reason?: 'TP' | 'SL' | 'MANUAL' | null;
          opened_at?: string;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      auto_trades: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          entry_price: number;
          tp: number;
          sl: number;
          qty: number;
          investment: number;
          status: 'OPEN' | 'TP_HIT' | 'SL_HIT' | 'MISSED';
          close_price: number | null;
          profit: number | null;
          opened_at: string;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          entry_price: number;
          tp: number;
          sl: number;
          qty: number;
          investment: number;
          status?: 'OPEN' | 'TP_HIT' | 'SL_HIT' | 'MISSED';
          close_price?: number | null;
          profit?: number | null;
          opened_at?: string;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          entry_price?: number;
          tp?: number;
          sl?: number;
          qty?: number;
          investment?: number;
          status?: 'OPEN' | 'TP_HIT' | 'SL_HIT' | 'MISSED';
          close_price?: number | null;
          profit?: number | null;
          opened_at?: string;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      auto_trader_settings: {
        Row: {
          id: string;
          user_id: string;
          capital: number;
          current_capital: number;
          risk_percent: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          capital?: number;
          current_capital?: number;
          risk_percent?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          capital?: number;
          current_capital?: number;
          risk_percent?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}