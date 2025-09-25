import React, { useState } from 'react';
import { MarketData } from '../../hooks/useBinanceTradingData';
import { useAutoTrader } from '../../hooks/useAutoTrader';
import { SettingsCard } from './SettingsCard';
import { PortfolioStatsCard } from './PortfolioStatsCard';
import { AutoTradeHistory } from './AutoTradeHistory';

interface AutoTraderDashboardProps {
  marketData: MarketData[];
}

export const AutoTraderDashboard: React.FC<AutoTraderDashboardProps> = ({ marketData }) => {
  const { settings, setSettings, autoTrades, portfolioStats } = useAutoTrader(marketData);

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
