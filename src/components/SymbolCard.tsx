import React from 'react';

interface SymbolCardProps {
  symbol: string;
  price: number;
  rsi: number | null;
}

export const SymbolCard: React.FC<SymbolCardProps> = ({ symbol, price, rsi }) => {
  const getRsiStyles = () => {
    if (rsi === null) {
      return {
        cardClasses: 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800',
        textColor: 'text-gray-500',
        pulse: false,
      };
    }
    if (rsi <= 40) { // Red for potential entry
      return {
        cardClasses: 'bg-red-900/40 border-red-500/50 hover:bg-red-900/60',
        textColor: 'text-red-400',
        pulse: rsi <= 30,
      };
    }
    if (rsi >= 60) { // Green for potential exit
      return {
        cardClasses: 'bg-green-900/40 border-green-500/50 hover:bg-green-900/60',
        textColor: 'text-green-400',
        pulse: rsi >= 70,
      };
    }
    // Neutral (between 40 and 60)
    return {
      cardClasses: 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800',
      textColor: 'text-gray-300',
      pulse: false,
    };
  };

  const styles = getRsiStyles();

  return (
    <div className={`p-3 text-center transition-all duration-300 rounded-lg border ${styles.cardClasses} hover:scale-105`}>
      <p className="font-bold text-white text-md truncate" title={symbol}>{symbol}</p>
      <p className="font-mono text-xl my-2 text-gray-100">{price.toLocaleString()}</p>
      <div className="text-sm">
        <span className="text-gray-400">RSI: </span>
        <span className={`font-semibold ${styles.textColor} ${styles.pulse ? 'animate-pulse' : ''}`}>
          {rsi !== null ? rsi.toFixed(2) : 'N/A'}
        </span>
      </div>
    </div>
  );
};
