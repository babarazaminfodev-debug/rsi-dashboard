import React, { useState, useEffect } from 'react';
import { Alert } from '../types';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { XCircleIcon } from './icons/XCircleIcon';

interface AlertHistoryModalProps {
  onClose: () => void;
}

export const AlertHistoryModal: React.FC<AlertHistoryModalProps> = ({ onClose }) => {
  const [historicalAlerts, setHistoricalAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { loadAlerts, isConnected } = useSupabaseData();

  useEffect(() => {
    if (isConnected) {
      loadAlerts(200).then(alerts => {
        setHistoricalAlerts(alerts);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isConnected, loadAlerts]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[80vh] border border-gray-700 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <XCircleIcon />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">RSI Alerts History</h2>
        
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Database not connected. Please connect to Supabase to view alert history.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading alerts...</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            {historicalAlerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 sticky top-0">
                    <tr>
                      <th scope="col" className="p-3">Symbol</th>
                      <th scope="col" className="p-3">RSI</th>
                      <th scope="col" className="p-3">Price</th>
                      <th scope="col" className="p-3">Level</th>
                      <th scope="col" className="p-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalAlerts.map(alert => {
                      const isOversold = alert.level <= 30;
                      return (
                        <tr key={alert.id} className="border-b border-gray-700/50 hover:bg-gray-800/60">
                          <td className="p-3 font-medium">{alert.symbol}</td>
                          <td className={`p-3 font-mono font-semibold ${isOversold ? 'text-green-400' : 'text-red-400'}`}>
                            {alert.rsi.toFixed(2)}
                          </td>
                          <td className="p-3 font-mono">{alert.price.toLocaleString()}</td>
                          <td className={`p-3 font-semibold ${isOversold ? 'text-green-400' : 'text-red-400'}`}>
                            {isOversold ? 'Oversold' : 'Overbought'}
                          </td>
                          <td className="p-3 text-gray-400">
                            {alert.createdAt.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No alerts found in history.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};