
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
