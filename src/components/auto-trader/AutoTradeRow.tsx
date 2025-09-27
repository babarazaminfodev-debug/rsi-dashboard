import React from 'react';
import { AutoTrade, AutoTradeStatus } from '@/types';
import { BotIcon } from '@/components/icons/BotIcon';
import { formatDuration } from '@/utils/formatters';


interface AutoTradeRowProps {
  trade: AutoTrade;
}

const getStatusStyles = (status: AutoTradeStatus) => {
    switch(status) {
        case AutoTradeStatus.OPEN:
            return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'OPEN' };
        case AutoTradeStatus.TP_HIT:
            return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'TP HIT' };
        case AutoTradeStatus.SL_HIT:
            return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'SL HIT' };
        case AutoTradeStatus.MISSED:
            return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'MISSED' };
        default:
            return { bg: '', text: '', label: '' };
    }
}

export const AutoTradeRow: React.FC<AutoTradeRowProps> = ({ trade }) => {
    const statusStyle = getStatusStyles(trade.status);
    const isClosed = trade.status === AutoTradeStatus.TP_HIT || trade.status === AutoTradeStatus.SL_HIT;
    const isMissed = trade.status === AutoTradeStatus.MISSED;
    
    const pnlColor = trade.profit && trade.profit > 0 ? 'text-green-500' : 'text-red-500';
    
    return (
      <tr className={`hover:bg-gray-800/60 transition-colors ${(isMissed || isClosed) && 'opacity-70'}`}>
        <td className="p-3 font-medium flex items-center gap-2">
            <BotIcon className={statusStyle.text} />
            {trade.symbol}
        </td>
        <td className="p-3">
            <span className={`px-2 py-1 text-xs font-semibold rounded-md ${statusStyle.bg} ${statusStyle.text}`}>
                {statusStyle.label}
            </span>
        </td>
        <td className="p-3 font-mono text-xs hidden md:table-cell">
          <div>{trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 4 })}</div>
          <div className="text-gray-400">{trade.closePrice?.toLocaleString(undefined, { minimumFractionDigits: 4 }) || '---'}</div>
        </td>
        <td className={`p-3 font-mono font-bold ${isMissed ? 'text-gray-500' : pnlColor}`}>
            {isMissed ? 'N/A' : trade.profit?.toFixed(2) ?? '...'}
        </td>
        <td className="p-3 text-gray-400 text-sm hidden sm:table-cell">
            {trade.closedAt && trade.status !== AutoTradeStatus.OPEN ? formatDuration(new Date(trade.openedAt), new Date(trade.closedAt)) : '...'}
        </td>
      </tr>
    );
};