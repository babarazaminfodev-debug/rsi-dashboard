import React, { useMemo, useState } from 'react';
<<<<<<< HEAD
import { AutoTrade, Deposit, AutoTradeStatus } from '@/types';
=======
import { AutoTrade, Deposit, AutoTradeStatus } from '../../types';
>>>>>>> d9c53f4d6f536b217011ed3d8fb53d695764ac21

interface PortfolioStats {
  currentCapital: number;
  totalPnl: number;
  winRate: number;
  wins: number;
  losses: number;
}

interface PortfolioStatsCardProps {
  stats: PortfolioStats;
  onCapitalClick: () => void;
  trades: AutoTrade[];
  deposits: Deposit[];
}

const StatItem: React.FC<{ label: string; value: string | number; className?: string, isButton?: boolean, onClick?: () => void }> = ({ label, value, className, isButton, onClick }) => (
  <div className={`flex justify-between items-baseline text-sm ${isButton ? 'cursor-pointer hover:bg-gray-700/50 -mx-2 px-2 py-1 rounded-md' : ''}`} onClick={onClick}>
    <span className="text-gray-400">{label}</span>
    <span className={`font-semibold font-mono ${className}`}>{value}</span>
  </div>
);

const getStatsForPeriod = (trades: AutoTrade[], startDate: Date, endDate: Date) => {
    const periodTrades = trades.filter(t => {
        if (!t.closedAt) return false;
        const closedDate = new Date(t.closedAt);
        return closedDate >= startDate && closedDate < endDate;
    });
    const pnl = periodTrades.reduce((acc, t) => acc + (t.profit || 0), 0);
    return { pnl, count: periodTrades.length };
}

export const PortfolioStatsCard: React.FC<PortfolioStatsCardProps> = ({ stats, onCapitalClick, trades, deposits }) => {
  const [analysisPeriod, setAnalysisPeriod] = useState<'weekly' | 'monthly' | 'overall'>('overall');
  const pnlColor = stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400';
  const pnlSign = stats.totalPnl >= 0 ? '+' : '';

  const totalDeposited = useMemo(() => deposits.reduce((sum, d) => sum + d.amount, 0), [deposits]);

  const analysisData = useMemo(() => {
    const now = new Date();
    const closedTrades = trades.filter(t => t.status === AutoTradeStatus.TP_HIT || t.status === AutoTradeStatus.SL_HIT);

    if (analysisPeriod === 'weekly') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return getStatsForPeriod(closedTrades, startOfWeek, now);
    }
    if (analysisPeriod === 'monthly') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return getStatsForPeriod(closedTrades, startOfMonth, now);
    }
    // Overall
    return { pnl: stats.totalPnl, count: closedTrades.length };

  }, [analysisPeriod, trades, stats.totalPnl]);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-700/50">
        <h2 className="text-lg font-semibold text-white">Portfolio Overview</h2>
      </div>
      <div className="p-4 space-y-3">
        <StatItem label="Total Deposited" value={`$${totalDeposited.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
        <StatItem label="Portfolio Value" value={`$${stats.currentCapital.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} className="text-xl" isButton onClick={onCapitalClick}/>
        <hr className="border-gray-700" />
        
        <div className="bg-gray-900/50 rounded-lg p-2">
            <div className="flex justify-center gap-1 mb-2">
                {(['weekly', 'monthly', 'overall'] as const).map(p => (
                    <button key={p} onClick={() => setAnalysisPeriod(p)} className={`px-3 py-1 text-xs font-medium rounded-md capitalize ${analysisPeriod === p ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>{p}</button>
                ))}
            </div>
            <StatItem label={`${analysisPeriod} P/L`} value={`${analysisData.pnl >= 0 ? '+' : ''}$${analysisData.pnl.toFixed(2)}`} className={analysisData.pnl >= 0 ? 'text-green-400' : 'text-red-400'} />
            <StatItem label="Trades this Period" value={analysisData.count} />
        </div>

        <StatItem label="Win / Loss" value={`${stats.wins} / ${stats.losses}`} />
        <StatItem label="Overall Win Rate" value={`${stats.winRate.toFixed(1)}%`} className={stats.winRate > 50 ? 'text-green-400' : 'text-red-400'}/>
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> d9c53f4d6f536b217011ed3d8fb53d695764ac21
