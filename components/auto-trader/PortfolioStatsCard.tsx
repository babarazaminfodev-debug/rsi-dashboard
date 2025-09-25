import React from 'react';

interface PortfolioStats {
  initialCapital: number;
  currentCapital: number;
  totalPnl: number;
  winRate: number;
  wins: number;
  losses: number;
}

interface PortfolioStatsCardProps {
  stats: PortfolioStats;
}

const StatItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className }) => (
  <div className="flex justify-between items-baseline text-sm">
    <span className="text-gray-400">{label}</span>
    <span className={`font-semibold font-mono ${className}`}>{value}</span>
  </div>
);

export const PortfolioStatsCard: React.FC<PortfolioStatsCardProps> = ({ stats }) => {
  const pnlColor = stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400';
  const pnlSign = stats.totalPnl >= 0 ? '+' : '';

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-700/50">
        <h2 className="text-lg font-semibold text-white">Portfolio Overview</h2>
      </div>
      <div className="p-4 space-y-3">
        <StatItem label="Initial Capital" value={`$${stats.initialCapital.toLocaleString()}`} />
        <StatItem label="Current Capital" value={`$${stats.currentCapital.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} className="text-xl" />
        <hr className="border-gray-700" />
        <StatItem label="Total P/L" value={`${pnlSign}$${stats.totalPnl.toFixed(2)}`} className={pnlColor} />
        <StatItem label="Win / Loss" value={`${stats.wins} / ${stats.losses}`} />
        <StatItem label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} className={stats.winRate > 50 ? 'text-green-400' : 'text-red-400'}/>
      </div>
    </div>
  );
};
