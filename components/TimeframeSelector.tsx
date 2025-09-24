
import React from 'react';

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h'];

interface TimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ selectedTimeframe, onTimeframeChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700/50 rounded-lg p-2">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onTimeframeChange(tf)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            selectedTimeframe === tf
              ? 'bg-indigo-600 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {tf.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
