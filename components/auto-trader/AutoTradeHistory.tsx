import React, { useState, useMemo } from 'react';
import { AutoTrade, AutoTradeStatus } from '../../types';
import { SYMBOLS } from '../../constants';
import { AutoTradeRow } from './AutoTradeRow';

interface AutoTradeHistoryProps {
  trades: AutoTrade[];
}

export const AutoTradeHistory: React.FC<AutoTradeHistoryProps> = ({ trades }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const filteredTrades = useMemo(() => {
    const sorted = [...trades].sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime());
    if (!selectedSymbol) return sorted;
    return sorted.filter(trade => trade.symbol === selectedSymbol);
  }, [trades, selectedSymbol]);

  const symbolWinRate = useMemo(() => {
    if (!selectedSymbol) return null;
    const symbolTrades = trades.filter(t => t.symbol === selectedSymbol && (t.status === AutoTradeStatus.TP_HIT || t.status === AutoTradeStatus.SL_HIT));
    if (symbolTrades.length === 0) return 0;
    const wins = symbolTrades.filter(t => t.status === AutoTradeStatus.TP_HIT).length;
    return (wins / symbolTrades.length) * 100;
  }, [trades, selectedSymbol]);

  const allSymbols = ['All', ...SYMBOLS];

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg flex flex-col">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Trade History</h2>
        {selectedSymbol && symbolWinRate !== null && (
          <div className="text-sm">
            <span className="text-gray-400">{selectedSymbol} Win Rate: </span>
            <span className={`font-bold ${symbolWinRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{symbolWinRate.toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex flex-wrap gap-2">
          {allSymbols.map(symbol => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol === 'All' ? null : symbol)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                (selectedSymbol === symbol || (selectedSymbol === null && symbol === 'All'))
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto max-h-[calc(100vh-350px)]">
        {filteredTrades.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800 sticky top-0">
              <tr>
                <th scope="col" className="p-3">Symbol</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3 hidden md:table-cell">Entry/Close</th>
                <th scope="col" className="p-3">P/L ($)</th>
                <th scope="col" className="p-3 hidden sm:table-cell">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredTrades.map(trade => <AutoTradeRow key={trade.id} trade={trade} />)}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-16">No trades yet. Activate the bot to start.</p>
        )}
      </div>
    </div>
  );
};
