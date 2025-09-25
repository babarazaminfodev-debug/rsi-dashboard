import React from 'react';

interface HeaderProps {
  loading: boolean;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ loading, onLoginClick, onSignupClick }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight text-white">RSI Realtime Dashboard</h1>
          </div>
          <div className="flex items-center gap-6">
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
            <div className="flex items-center gap-2">
                <button onClick={onLoginClick} className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700/50 transition-colors">Login</button>
                <button onClick={onSignupClick} className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};