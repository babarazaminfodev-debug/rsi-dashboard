import React from 'react';

interface HeaderProps {
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ loading }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight text-white">RSI Realtime Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            {loading ? (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-400">Connecting...</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Realtime Connected</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
