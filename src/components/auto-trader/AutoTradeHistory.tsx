import React, { useMemo } from 'react';
<<<<<<< HEAD
import { AutoTrade } from '@/types';
import { AutoTradeRow } from './AutoTradeRow';
import { formatDateGroup } from '@/utils/formatters';
=======
import { AutoTrade, AutoTradeStatus } from '../../types';
import { AutoTradeRow } from './AutoTradeRow';
import { formatDateGroup } from '../../utils/formatters';
>>>>>>> d9c53f4d6f536b217011ed3d8fb53d695764ac21

interface AutoTradeHistoryProps {
  trades: AutoTrade[];
}

export const AutoTradeHistory: React.FC<AutoTradeHistoryProps> = ({ trades }) => {

  const groupedTrades = useMemo(() => {
    const sorted = [...trades].sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
    
    return sorted.reduce((acc, trade) => {
        const dateKey = new Date(trade.closedAt || trade.openedAt).toISOString().split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(trade);
        return acc;
    }, {} as Record<string, AutoTrade[]>);

  }, [trades]);

  const sortedGroupKeys = useMemo(() => Object.keys(groupedTrades).sort().reverse(), [groupedTrades]);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Trade History</h2>
        <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{trades.length} Total</span>
      </div>
      
      <div className="flex-grow overflow-y-auto max-h-[calc(100vh-350px)]">
        {trades.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800 sticky top-0 z-10">
              <tr>
                <th scope="col" className="p-3">Symbol</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3 hidden md:table-cell">Entry/Close</th>
                <th scope="col" className="p-3">P/L ($)</th>
                <th scope="col" className="p-3 hidden sm:table-cell">Duration</th>
              </tr>
            </thead>
            <tbody>
              {sortedGroupKeys.map(dateKey => (
                <React.Fragment key={dateKey}>
                    <tr className="bg-gray-900/60">
                        <td colSpan={5} className="p-2 text-center text-xs font-bold text-gray-400 tracking-wider">
                            {formatDateGroup(dateKey)}
                        </td>
                    </tr>
                    {groupedTrades[dateKey].map(trade => <AutoTradeRow key={trade.id} trade={trade} />)}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-16">No trades yet. Activate the bot to start.</p>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> d9c53f4d6f536b217011ed3d8fb53d695764ac21
