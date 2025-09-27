import React, { useState } from 'react';
import { Alert } from '@/types';
import { AlertCard } from './AlertCard';

interface AlertsViewProps {
    alerts30: Alert[];
    alerts25: Alert[];
    onLogTrade: (alert: Alert) => void;
}

type AlertTab = 'rsi30' | 'rsi25';

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts30, alerts25, onLogTrade }) => {
    const [activeTab, setActiveTab] = useState<AlertTab>('rsi30');
    
    const alertsToShow = activeTab === 'rsi30' ? alerts30 : alerts25;

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg flex flex-col">
            <div className="p-2 border-b border-gray-700/50 flex justify-around items-center">
                 <button 
                    onClick={() => setActiveTab('rsi30')}
                    className={`flex-1 text-center font-semibold p-2 rounded-md transition-colors ${activeTab === 'rsi30' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    Warnings ({alerts30.length})
                </button>
                <button 
                    onClick={() => setActiveTab('rsi25')}
                    className={`flex-1 text-center font-semibold p-2 rounded-md transition-colors ${activeTab === 'rsi25' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    Signals ({alerts25.length})
                </button>
            </div>
             <div className="p-4 flex-grow">
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
                    {alertsToShow.length > 0 ? (
                      alertsToShow.map(alert => (
                        <AlertCard key={alert.id} alert={alert} onLogTrade={onLogTrade} />
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-8">No new {activeTab === 'rsi30' ? 'warnings' : 'signals'}.</p>
                    )}
                  </div>
            </div>
        </div>
    );
};