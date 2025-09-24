
import React, { useState, useEffect } from 'react';
import { Alert, PaperTrade, TradeSide } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface LogTradeModalProps {
  alert: Alert;
  onClose: () => void;
  onLogTrade: (tradeData: Omit<PaperTrade, 'id' | 'status' | 'openedAt'>) => void;
}

export const LogTradeModal: React.FC<LogTradeModalProps> = ({ alert, onClose, onLogTrade }) => {
  const isOversold = alert.level <= 30;
  const initialSide = isOversold ? TradeSide.BUY : TradeSide.SELL;
  
  const [side, setSide] = useState<TradeSide>(initialSide);
  const [entryPrice, setEntryPrice] = useState(alert.price.toString());
  const [tp, setTp] = useState('');
  const [sl, setSl] = useState('');
  const [qty, setQty] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const entry = parseFloat(entryPrice);
    if (!isNaN(entry)) {
        const riskRewardRatio = 1.5;
        const priceChange = entry * 0.02; // 2% price change for TP/SL
        if (side === TradeSide.BUY) {
            setTp((entry + priceChange * riskRewardRatio).toFixed(4));
            setSl((entry - priceChange).toFixed(4));
        } else {
            setTp((entry - priceChange * riskRewardRatio).toFixed(4));
            setSl((entry + priceChange).toFixed(4));
        }
    }
  }, [entryPrice, side]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all numeric inputs
    const parsedEntryPrice = parseFloat(entryPrice);
    const parsedTp = parseFloat(tp);
    const parsedSl = parseFloat(sl);
    const parsedQty = parseFloat(qty);
    
    const newErrors: {[key: string]: string} = {};
    
    if (isNaN(parsedEntryPrice) || parsedEntryPrice <= 0) {
      newErrors.entryPrice = 'Entry price must be a valid positive number';
    }
    if (isNaN(parsedTp) || parsedTp <= 0) {
      newErrors.tp = 'Take profit must be a valid positive number';
    }
    if (isNaN(parsedSl) || parsedSl <= 0) {
      newErrors.sl = 'Stop loss must be a valid positive number';
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      newErrors.qty = 'Quantity must be a valid positive number';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    // Validate all numeric inputs
    const parsedEntryPrice = parseFloat(entryPrice);
    const parsedTp = parseFloat(tp);
    const parsedSl = parseFloat(sl);
    const parsedQty = parseFloat(qty);
    
    const newErrors: {[key: string]: string} = {};
    
    if (isNaN(parsedEntryPrice) || parsedEntryPrice <= 0) {
      newErrors.entryPrice = 'Entry price must be a valid positive number';
    }
    if (isNaN(parsedTp) || parsedTp <= 0) {
      newErrors.tp = 'Take profit must be a valid positive number';
    }
    if (isNaN(parsedSl) || parsedSl <= 0) {
      newErrors.sl = 'Stop loss must be a valid positive number';
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      newErrors.qty = 'Quantity must be a valid positive number';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onLogTrade({
      symbol: alert.symbol,
      side,
      entryPrice: parsedEntryPrice,
      tp: parsedTp,
      sl: parsedSl,
      qty: parsedQty,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-700 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <XCircleIcon />
        </button>
        <h2 className="text-2xl font-bold mb-2">Log Trade for {alert.symbol}</h2>
        <p className="text-gray-400 mb-6">Based on RSI alert at {alert.price.toLocaleString()}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Side</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSide(TradeSide.BUY)} className={`p-3 rounded-md font-semibold text-center transition-all ${side === TradeSide.BUY ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-gray-700 hover:bg-gray-600'}`}>BUY</button>
              <button type="button" onClick={() => setSide(TradeSide.SELL)} className={`p-3 rounded-md font-semibold text-center transition-all ${side === TradeSide.SELL ? 'bg-red-600 text-white ring-2 ring-red-400' : 'bg-gray-700 hover:bg-gray-600'}`}>SELL</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="entryPrice" className="block text-sm font-medium text-gray-300 mb-1">Entry Price</label>
              <input type="number" id="entryPrice" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className={`w-full bg-gray-900 border rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.entryPrice ? 'border-red-500' : 'border-gray-600'}`} required />
              {errors.entryPrice && <p className="text-red-400 text-xs mt-1">{errors.entryPrice}</p>}
              {errors.entryPrice && <p className="text-red-400 text-xs mt-1">{errors.entryPrice}</p>}
            </div>
            <div>
              <label htmlFor="qty" className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
              <input type="number" id="qty" value={qty} onChange={e => setQty(e.target.value)} className={`w-full bg-gray-900 border rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.qty ? 'border-red-500' : 'border-gray-600'}`} required />
              {errors.qty && <p className="text-red-400 text-xs mt-1">{errors.qty}</p>}
              {errors.qty && <p className="text-red-400 text-xs mt-1">{errors.qty}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tp" className="block text-sm font-medium text-green-400 mb-1">Take Profit (TP)</label>
              <input type="number" id="tp" value={tp} onChange={e => setTp(e.target.value)} className={`w-full bg-gray-900 border rounded-md p-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.tp ? 'border-red-500' : 'border-gray-600'}`} required />
              {errors.tp && <p className="text-red-400 text-xs mt-1">{errors.tp}</p>}
              {errors.tp && <p className="text-red-400 text-xs mt-1">{errors.tp}</p>}
            </div>
            <div>
              <label htmlFor="sl" className="block text-sm font-medium text-red-400 mb-1">Stop Loss (SL)</label>
              <input type="number" id="sl" value={sl} onChange={e => setSl(e.target.value)} className={`w-full bg-gray-900 border rounded-md p-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.sl ? 'border-red-500' : 'border-gray-600'}`} required />
              {errors.sl && <p className="text-red-400 text-xs mt-1">{errors.sl}</p>}
              {errors.sl && <p className="text-red-400 text-xs mt-1">{errors.sl}</p>}
            </div>
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition-colors">
            Create Paper Trade
          </button>
        </form>
      </div>
    </div>
  );
};
