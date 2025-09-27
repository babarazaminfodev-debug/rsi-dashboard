import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { AutoTraderSettings } from '@/types';
import { PlusCircleIcon } from '@/components/icons/PlusCircleIcon';
=======
import { AutoTraderSettings } from '../../types';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
>>>>>>> d9c53f4d6f536b217011ed3d8fb53d695764ac21

interface SettingsCardProps {
  settings: AutoTraderSettings;
  onSettingsChange: (newSettings: AutoTraderSettings) => void;
  onDepositClick: () => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ settings, onSettingsChange, onDepositClick }) => {
  const [capital, setCapital] = useState(settings.capital.toString());
  const [riskPercent, setRiskPercent] = useState(settings.riskPercent.toString());

  const handleSave = () => {
    onSettingsChange({
      ...settings,
      capital: parseFloat(capital) || 0,
      riskPercent: parseFloat(riskPercent) || 0,
    });
  };
  
  const toggleIsActive = () => {
    onSettingsChange({ ...settings, isActive: !settings.isActive });
  };
  
  useEffect(() => {
    setCapital(settings.capital.toString());
    setRiskPercent(settings.riskPercent.toString());
  }, [settings]);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Auto-Pilot Settings</h2>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
            <div className="flex-grow">
              <label htmlFor="capital" className="block text-sm font-medium text-gray-300 mb-1">Trade Size ($)</label>
              <input
                type="number"
                id="capital"
                value={capital}
                onChange={e => setCapital(e.target.value)}
                onBlur={handleSave}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 100"
              />
            </div>
             <div className="flex-grow">
              <label htmlFor="risk" className="block text-sm font-medium text-gray-300 mb-1">per Trade (%)</label>
              <input
                type="number"
                id="risk"
                value={riskPercent}
                onChange={e => setRiskPercent(e.target.value)}
                onBlur={handleSave}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 10"
              />
            </div>
        </div>
        <button
            onClick={onDepositClick}
            className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
            <PlusCircleIcon />
            Deposit Funds
        </button>
        <button
          onClick={toggleIsActive}
          className={`w-full font-bold py-3 px-4 rounded-md transition-all duration-300 text-lg flex items-center justify-center gap-2 ${
            settings.isActive 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {settings.isActive ? 'DEACTIVATE BOT' : 'ACTIVATE BOT'}
          <span className={`w-3 h-3 rounded-full ${settings.isActive ? 'bg-white animate-pulse' : 'bg-white'}`}></span>
        </button>
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> d9c53f4d6f536b217011ed3d8fb53d695764ac21
