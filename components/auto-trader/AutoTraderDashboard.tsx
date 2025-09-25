import React, { useState } from 'react';
import { MarketData } from '../../hooks/useBinanceTradingData';
import { useAutoTrader } from '../../hooks/useAutoTrader';
import { ToastMessage } from '../Toast';
import { SettingsCard } from './SettingsCard';
import { PortfolioStatsCard } from './PortfolioStatsCard';
import { AutoTradeHistory } from './AutoTradeHistory';

interface AutoTraderDashboardProps {
  marketData: MarketData[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AutoTraderDashboard: React.FC<AutoTraderDashboardProps> = ({ marketData, addToast }) => {
  const { settings, setSettings, autoTrades, portfolioStats } = useAutoTrader(marketData, addToast);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <SettingsCard settings={settings} onSettingsChange={setSettings} />
        <PortfolioStatsCard stats={portfolioStats} />
      </div>
      <div className="lg:col-span-2">
        <AutoTradeHistory trades={autoTrades} />
      </div>
    </div>
  );
};
