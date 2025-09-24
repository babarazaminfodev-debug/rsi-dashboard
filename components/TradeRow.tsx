
import React from 'react';
import { PaperTrade, TradeStatus, TradeSide } from '../types';
import { ArrowUpRightIcon } from './icons/ArrowUpRightIcon';
import { ArrowDownLeftIcon } from './icons/ArrowDownLeftIcon';

interface TradeRowProps {
  trade: PaperTrade;
}

const formatDuration = (start: Date, end: Date): string => {
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
};

export const TradeRow: React.FC<TradeRowProps> = ({ trade }) => {
  const isBuy = trade.side === TradeSide.BUY;

  if (trade.status === TradeStatus.OPEN) {
    return (
      <tr className="border-b border-gray-700/50 hover:bg-gray-800/60">
        <td className="p-3 font-medium flex items-center gap-2">
            {isBuy ? <ArrowUpRightIcon className="text-green-500" /> : <ArrowDownLeftIcon className="text-red-500" />}
            {trade.symbol}
        </td>
        <td className="p-3 hidden md:table-cell">
          <span className={`px-2 py-1 text-xs font-semibold rounded-md ${isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {trade.side}
          </span>
        </td>
        <td className="p-3 font-mono">{trade.entryPrice.toLocaleString()}</td>
        <td className="p-3 font-mono text-xs">
          <div className="text-green-400">{trade.tp.toLocaleString()}</div>
          <div className="text-red-400">{trade.sl.toLocaleString()}</div>
        </td>
        <td className="p-3 font-mono hidden sm:table-cell">{trade.qty}</td>
        <td className="p-3 text-gray-400 text-sm hidden lg:table-cell">{trade.openedAt.toLocaleTimeString()}</td>
      </tr>
    );
  }

  // Closed Trade Row
  const isProfit = (trade.profit ?? 0) >= 0;

  return (
      <tr className="border-b border-gray-700/50 hover:bg-gray-800/60 opacity-70">
        <td className="p-3 font-medium flex items-center gap-2">
            {isBuy ? <ArrowUpRightIcon className="text-gray-500" /> : <ArrowDownLeftIcon className="text-gray-500" />}
            {trade.symbol}
        </td>
        <td className="p-3 hidden sm:table-cell">
            <span className={`px-2 py-1 text-xs font-semibold rounded-md ${isBuy ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {trade.side}
            </span>
        </td>
        <td className={`p-3 font-mono font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
            {trade.profit?.toFixed(2)}
        </td>
        <td className="p-3 text-gray-300 text-sm hidden md:table-cell">{trade.reason}</td>
        <td className="p-3 text-gray-400 text-sm hidden lg:table-cell">
            {trade.closedAt ? formatDuration(trade.openedAt, trade.closedAt) : '-'}
        </td>
      </tr>
  );
};
