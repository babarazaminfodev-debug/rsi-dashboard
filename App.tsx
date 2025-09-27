import React, { useState, useEffect } from 'react';
import { useBinanceTradingData } from './hooks/useBinanceTradingData';
import { Alert, PaperTrade, TradeStatus, CloseReason, TradeSide } from './types';
import { Header } from './components/Header';
import { MarketOverview } from './components/MarketOverview';
import { TimeframeSelector } from './components/TimeframeSelector';
import { Card } from './components/Card';
import { LogTradeModal } from './components/LogTradeModal';
import { TradeRow } from './components/TradeRow';
import { DashboardToggle } from './components/DashboardToggle';
import { AutoTraderDashboard } from './components/auto-trader/AutoTraderDashboard';
import { AuthModal } from './components/AuthModal';
import { AlertsView } from './components/AlertsView';

const App: React.FC = () => {
  const [timeframe, setTimeframe] = useState('5m');
  const [dashboardMode, setDashboardMode] = useState<'manual' | 'auto'>('manual');
  const { marketData, alertsRsi30, alertsRsi25, loading } = useBinanceTradingData(timeframe);
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>(() => {
     try {
        const savedTrades = localStorage.getItem('paperTrades');
        return savedTrades ? JSON.parse(savedTrades, (key, value) => {
            if (key === 'openedAt' || key === 'closedAt') return new Date(value);
            return value;
        }) : [];
    } catch (error) {
        return [];
    }
  });
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openTrades = paperTrades.filter(t => t.status === TradeStatus.OPEN);
  const closedTrades = paperTrades.filter(t => t.status === TradeStatus.CLOSED);

  // Persist paper trades to localStorage
  useEffect(() => {
    localStorage.setItem('paperTrades', JSON.stringify(paperTrades));
  }, [paperTrades]);

  // Effect to check for TP/SL on open trades
  React.useEffect(() => {
    if (marketData.length > 0 && openTrades.length > 0) {
      const tradesToUpdate: PaperTrade[] = [];
      
      openTrades.forEach(trade => {
        const currentMarketData = marketData.find(m => m.symbol === trade.symbol);
        if (!currentMarketData || currentMarketData.price === 0) return;

        const currentPrice = currentMarketData.price;
        let reason: CloseReason | null = null;
        
        if (trade.side === TradeSide.BUY) {
          if (currentPrice >= trade.tp) reason = CloseReason.TP;
          else if (currentPrice <= trade.sl) reason = CloseReason.SL;
        } else { // SELL
          if (currentPrice <= trade.tp) reason = CloseReason.TP;
          else if (currentPrice >= trade.sl) reason = CloseReason.SL;
        }

        if (reason) {
          const profit = (trade.side === TradeSide.BUY) 
            ? (currentPrice - trade.entryPrice) * trade.qty 
            : (trade.entryPrice - currentPrice) * trade.qty;

          tradesToUpdate.push({
            ...trade,
            status: TradeStatus.CLOSED,
            closedAt: new Date(),
            closePrice: currentPrice,
            profit,
            reason,
          });
        }
      });

      if (tradesToUpdate.length > 0) {
        setPaperTrades(prevTrades =>
          prevTrades.map(pt => tradesToUpdate.find(ut => ut.id === pt.id) || pt)
        );
      }
    }
  }, [marketData, openTrades]);

  const handleLogTrade = (tradeData: Omit<PaperTrade, 'id' | 'status' | 'openedAt'>) => {
    const newTrade: PaperTrade = {
      ...tradeData,
      id: `${Date.now()}-${tradeData.symbol}`,
      status: TradeStatus.OPEN,
      openedAt: new Date(),
    };
    setPaperTrades(prev => [newTrade, ...prev]);
    setSelectedAlert(null);
  };

  const handleOpenLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header 
        loading={loading} 
        onLoginClick={handleOpenLogin} 
        onSignupClick={handleOpenSignup} 
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-4">
              <DashboardToggle mode={dashboardMode} setMode={setDashboardMode} />
              <div className="hidden sm:block">
                <TimeframeSelector selectedTimeframe={timeframe} onTimeframeChange={setTimeframe} />
              </div>
            </div>
        </div>

        {/* Mobile-only Timeframe Selector */}
        <div className="block sm:hidden">
          <TimeframeSelector selectedTimeframe={timeframe} onTimeframeChange={setTimeframe} />
        </div>

        {dashboardMode === 'manual' ? (
          <>
            <MarketOverview marketData={marketData} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <AlertsView
                    alerts30={alertsRsi30}
                    alerts25={alertsRsi25}
                    onLogTrade={(alert) => setSelectedAlert(alert)}
                />
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card title="Open Trades" count={openTrades.length}>
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    {openTrades.length > 0 ? (
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                          <tr>
                            <th scope="col" className="p-3">Symbol</th>
                            <th scope="col" className="p-3 hidden md:table-cell">Side</th>
                            <th scope="col" className="p-3">Entry</th>
                            <th scope="col" className="p-3">TP/SL</th>
                            <th scope="col" className="p-3 hidden sm:table-cell">Qty</th>
                            <th scope="col" className="p-3 hidden lg:table-cell">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {openTrades.map(trade => <TradeRow key={trade.id} trade={trade} />)}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-400 text-center py-8">No open trades.</p>
                    )}
                  </div>
                </Card>

                <Card title="Trade History" count={closedTrades.length}>
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  {closedTrades.length > 0 ? (
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                          <tr>
                            <th scope="col" className="p-3">Symbol</th>
                            <th scope="col" className="p-3 hidden sm:table-cell">Side</th>
                            <th scope="col" className="p-3">Profit</th>
                            <th scope="col" className="p-3 hidden md:table-cell">Reason</th>
                            <th scope="col" className="p-3 hidden lg:table-cell">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {closedTrades.map(trade => <TradeRow key={trade.id} trade={trade} />)}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-400 text-center py-8">No closed trades yet.</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <AutoTraderDashboard marketData={marketData} />
        )}
      </main>

      {selectedAlert && (
        <LogTradeModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onLogTrade={handleLogTrade}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={handleCloseAuthModal}
        />
      )}
    </div>
  );
};

export default App;
