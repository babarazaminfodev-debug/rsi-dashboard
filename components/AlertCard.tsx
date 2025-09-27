
import React from 'react';
import { Alert } from '../types';
import { formatTimeAgo } from '../utils/formatters';

interface AlertCardProps {
  alert: Alert;
  onLogTrade: (alert: Alert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onLogTrade }) => {
  const isOversold = alert.level <= 30;

  return (
    <div className={`p-4 rounded-lg border-l-4 ${isOversold ? 'border-green-500' : 'border-red-500'} bg-gray-800 hover:bg-gray-700/50 transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg">{alert.symbol}</p>
            {alert.count > 1 && (
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    x{alert.count}
                </span>
            )}
            <span className={`text-sm font-semibold ${isOversold ? 'text-green-400' : 'text-red-400'}`}>
              RSI: {alert.rsi.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-400">Price: {alert.price.toLocaleString()}</p>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{formatTimeAgo(alert.lastTriggeredAt)}</span>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onLogTrade(alert)}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            isOversold
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Log Trade
        </button>
      </div>
    </div>
  );
};
