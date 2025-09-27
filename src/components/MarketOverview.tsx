import React from 'react';
import { MarketData } from '@/hooks/useBinanceTradingData';
import { SymbolCard } from './SymbolCard';

interface MarketOverviewProps {
  marketData: MarketData[];
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ marketData }) => {
  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
       <h2 className="text-lg font-semibold text-white mb-4">Market Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {marketData.length > 0 ? (
          marketData.map((data) => (
            <SymbolCard
              key={data.symbol}
              symbol={data.symbol}
              price={data.price}
              rsi={data.rsi}
            />
          ))
        ) : (
          // Skeleton loaders
          Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center animate-pulse">
                <div className="h-5 bg-gray-700 rounded w-3/4 mx-auto mb-3"></div>
                <div className="h-7 bg-gray-700 rounded w-1/2 mx-auto mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4 mx-auto"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};