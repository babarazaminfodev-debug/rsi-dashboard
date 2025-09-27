import React from 'react';

interface DashboardToggleProps {
  mode: 'manual' | 'auto';
  setMode: (mode: 'manual' | 'auto') => void;
}

export const DashboardToggle: React.FC<DashboardToggleProps> = ({ mode, setMode }) => {
  const isAuto = mode === 'auto';
  return (
    <div className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700/50 rounded-full p-1 cursor-pointer" onClick={() => setMode(isAuto ? 'manual' : 'auto')}>
      <span className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${!isAuto ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}>
        Manual
      </span>
      <span className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${isAuto ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}>
        Auto-Pilot
      </span>
    </div>
  );
};
