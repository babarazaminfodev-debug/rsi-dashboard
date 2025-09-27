
export enum TradeSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum TradeStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum CloseReason {
  TP = 'TP',
  SL = 'SL',
  MANUAL = 'MANUAL',
}

export interface Alert {
  id: string;
  symbol: string;
  rsi: number;
  price: number;
  level: number;
  createdAt: Date;
  count: number;
  lastTriggeredAt: Date;
  isReset: boolean;
}

export interface PaperTrade {
  id: string;
  symbol: string;
  entryPrice: number;
  tp: number;
  sl: number;
  qty: number;
  side: TradeSide;
  status: TradeStatus;
  openedAt: Date;
  closedAt?: Date;
  closePrice?: number;
  profit?: number;
  reason?: CloseReason;
}

// Types for Auto-Trader
export enum AutoTradeStatus {
  OPEN = 'OPEN',
  TP_HIT = 'TP_HIT',
  SL_HIT = 'SL_HIT',
  MISSED = 'MISSED',
}

export interface AutoTrade {
  id: string;
  symbol: string;
  entryPrice: number;
  tp: number;
  sl: number;
  qty: number;
  investment: number;
  status: AutoTradeStatus;
  openedAt: Date;
  closedAt?: Date;
  closePrice?: number;
  profit?: number;
}

export interface Deposit {
  id: string;
  amount: number;
  date: Date;
}

export interface AutoTraderSettings {
  capital: number;
  riskPercent: number;
  isActive: boolean;
}
