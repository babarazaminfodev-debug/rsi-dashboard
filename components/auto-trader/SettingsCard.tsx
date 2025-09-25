import React, { useState, useEffect } from 'react';
import { AutoTraderSettings } from '../../types';

interface SettingsCardProps {
  settings: AutoTraderSettings;
  onSettingsChange: (newSettings: AutoTraderSettings) => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ settings, onSettingsChange }) => {
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
        <div>
          <label htmlFor="capital" className="block text-sm font-medium text-gray-300 mb-1">Total Capital ($)</label>
          <input
            type="number"
            id="capital"
            value={capital}
            onChange={e => setCapital(e.target.value)}
            onBlur={handleSave}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., 1000"
          />
        </div>
        <div>
          <label htmlFor="risk" className="block text-sm font-medium text-gray-300 mb-1">Investment per Trade (%)</label>
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
};
