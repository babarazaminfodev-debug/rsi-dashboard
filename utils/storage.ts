import { PaperTrade, AutoTrade, AutoTraderSettings } from '../types';

const STORAGE_KEYS = {
  PAPER_TRADES: 'rsi_dashboard_paper_trades',
  AUTO_TRADES: 'rsi_dashboard_auto_trades',
  AUTO_TRADER_SETTINGS: 'rsi_dashboard_auto_trader_settings',
  AUTO_TRADER_CAPITAL: 'rsi_dashboard_auto_trader_capital',
} as const;

// Paper Trades Storage
export const savePaperTrades = (trades: PaperTrade[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAPER_TRADES, JSON.stringify(trades));
  } catch (error) {
    console.error('Failed to save paper trades:', error);
  }
};

export const loadPaperTrades = (): PaperTrade[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAPER_TRADES);
    if (!stored) return [];
    
    const trades = JSON.parse(stored);
    return trades.map((trade: any) => ({
      ...trade,
      openedAt: new Date(trade.openedAt),
      closedAt: trade.closedAt ? new Date(trade.closedAt) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load paper trades:', error);
    return [];
  }
};

// Auto Trades Storage
export const saveAutoTrades = (trades: AutoTrade[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTO_TRADES, JSON.stringify(trades));
  } catch (error) {
    console.error('Failed to save auto trades:', error);
  }
};

export const loadAutoTrades = (): AutoTrade[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTO_TRADES);
    if (!stored) return [];
    
    const trades = JSON.parse(stored);
    return trades.map((trade: any) => ({
      ...trade,
      openedAt: new Date(trade.openedAt),
      closedAt: trade.closedAt ? new Date(trade.closedAt) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load auto trades:', error);
    return [];
  }
};

// Auto Trader Settings Storage
export const saveAutoTraderSettings = (settings: AutoTraderSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTO_TRADER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save auto trader settings:', error);
  }
};

export const loadAutoTraderSettings = (): AutoTraderSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTO_TRADER_SETTINGS);
    if (!stored) return { capital: 1000, riskPercent: 10, isActive: false };
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load auto trader settings:', error);
    return { capital: 1000, riskPercent: 10, isActive: false };
  }
};

// Auto Trader Capital Storage
export const saveAutoTraderCapital = (capital: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTO_TRADER_CAPITAL, capital.toString());
  } catch (error) {
    console.error('Failed to save auto trader capital:', error);
  }
};

export const loadAutoTraderCapital = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTO_TRADER_CAPITAL);
    if (!stored) return 1000;
    
    return parseFloat(stored) || 1000;
  } catch (error) {
    console.error('Failed to load auto trader capital:', error);
    return 1000;
  }
};

// Clear all data (useful for reset functionality)
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};