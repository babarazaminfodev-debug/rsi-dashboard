import React, { useState, useMemo } from 'react';
import { MarketData } from '../../hooks/useBinanceTradingData';
import { useAutoTrader } from '../../hooks/useAutoTrader';
import { AutoTradeStatus } from '../../types';
import { SettingsCard } from './SettingsCard';
import { PortfolioStatsCard } from './PortfolioStatsCard';
import { AutoTradeHistory } from './AutoTradeHistory';
import { OpenTradeCard } from './OpenTradeCard';
import { XCircleIcon } from '../icons/XCircleIcon';
import { WalletIcon } from '../icons/WalletIcon';

interface AutoTraderDashboardProps {
  marketData: MarketData[];
}

const DepositModal: React.FC<{onClose: () => void, onDeposit: (amount: number) => void}> = ({ onClose, onDeposit }) => {
    const [amount, setAmount] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const depositAmount = parseFloat(amount);
        if (depositAmount > 0) {
            onDeposit(depositAmount);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Add Capital</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                        placeholder="Enter amount"
                        autoFocus
                    />
                    <button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                        Deposit
                    </button>
                </form>
            </div>
        </div>
    );
};

const CapitalBreakdownModal: React.FC<{onClose: () => void, allocation: any}> = ({ onClose, allocation }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <XCircleIcon />
                </button>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><WalletIcon /> Capital Allocation</h2>
                <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-green-900/40 rounded-lg">
                        <span className="text-green-300">Available Capital</span>
                        <span className="font-mono font-bold text-green-300">${allocation.available.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    {Object.entries(allocation.invested).map(([symbol, amount]) => (
                         <div key={symbol} className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                            <span className="text-gray-300">Invested in {symbol}</span>
                            <span className="font-mono text-gray-300">${(amount as number).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-between p-3 mt-4 border-t border-gray-600">
                        <span className="font-bold">Total Portfolio Value</span>
                        <span className="font-mono font-bold">${allocation.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
            </div>
        </div>
    );
};

export const AutoTraderDashboard: React.FC<AutoTraderDashboardProps> = ({ marketData }) => {
  const { settings, setSettings, autoTrades, portfolioStats, addDeposit, deposits, capitalAllocation } = useAutoTrader(marketData);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isBreakdownModalOpen, setBreakdownModalOpen] = useState(false);

  const openTrades = useMemo(() => autoTrades.filter(t => t.status === AutoTradeStatus.OPEN), [autoTrades]);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <SettingsCard settings={settings} onSettingsChange={setSettings} onDepositClick={() => setDepositModalOpen(true)} />
                <PortfolioStatsCard stats={portfolioStats} onCapitalClick={() => setBreakdownModalOpen(true)} trades={autoTrades} deposits={deposits} />
            </div>
            <div className="lg:col-span-2">
                <AutoTradeHistory trades={autoTrades} />
            </div>
        </div>

        <div>
            <h2 className="text-xl font-semibold mb-4">Open Positions ({openTrades.length})</h2>
            {openTrades.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {openTrades.map(trade => {
                        const currentMarketData = marketData.find(m => m.symbol === trade.symbol);
                        return <OpenTradeCard key={trade.id} trade={trade} currentPrice={currentMarketData?.price} />;
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-800/30 border border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-400">No open positions. Bot will open trades on RSI signals.</p>
                </div>
            )}
        </div>

        {isDepositModalOpen && <DepositModal onClose={() => setDepositModalOpen(false)} onDeposit={addDeposit} />}
        {isBreakdownModalOpen && <CapitalBreakdownModal onClose={() => setBreakdownModalOpen(false)} allocation={capitalAllocation} />}

    </div>
  );
};
