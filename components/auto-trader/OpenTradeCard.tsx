import React from 'react';
import { AutoTrade } from '../../types';

interface OpenTradeCardProps {
  trade: AutoTrade;
  currentPrice?: number;
}

export const OpenTradeCard: React.FC<OpenTradeCardProps> = ({ trade, currentPrice }) => {
  const pnl = currentPrice ? (currentPrice - trade.entryPrice) * trade.qty : 0;
  const pnlPercent = currentPrice ? ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100 : 0;

  const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';
  const pnlBgColor = pnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20';
  const progressPercent = Math.abs(pnlPercent);

  const targetPercent = trade.tp && trade.sl ?
    (pnl >= 0 ?
      ((trade.tp - trade.entryPrice) / trade.entryPrice) * 100 :
      ((trade.sl - trade.entryPrice) / trade.entryPrice) * 100)
    : 0;

  const progressWidth = targetPercent !== 0 ? Math.min((progressPercent / Math.abs(targetPercent)) * 100, 100) : 0;

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg p-4 space-y-3 relative overflow-hidden">
      {/* Progress Bar Background */}
      <div className={`absolute top-0 left-0 h-full ${pnlBgColor} transition-all duration-500`} style={{ width: `${progressWidth}%`, opacity: 0.5 }}></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">{trade.symbol}</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${pnlBgColor} ${pnlColor}`}>
                {pnlPercent.toFixed(2)}%
            </div>
        </div>
        <div className="text-sm text-gray-400">
            Invested: ${trade.investment.toFixed(2)}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center my-4">
            <div>
                <div className="text-xs text-red-400">SL</div>
                <div className="font-mono text-sm">{trade.sl.toFixed(4)}</div>
            </div>
            <div>
                <div className="text-xs text-gray-300">Entry</div>
                <div className="font-mono font-bold text-lg text-white">{trade.entryPrice.toFixed(4)}</div>
            </div>
             <div>
                <div className="text-xs text-green-400">TP</div>
                <div className="font-mono text-sm">{trade.tp.toFixed(4)}</div>
            </div>
        </div>

         <div className="flex justify-between items-baseline bg-black/30 p-2 rounded-md">
            <span className="text-gray-300">Live P&L</span>
            <span className={`font-mono font-bold text-lg ${pnlColor}`}>
                ${pnl.toFixed(2)}
            </span>
        </div>
      </div>
    </div>
  );
};
