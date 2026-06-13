'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Holding } from '@/types/portfolio';
import { useStockQuote } from '@/hooks/useStockQuote';
import { calculateUnrealizedPL } from '@/lib/trading/calculations';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import { TradeForm } from '@/components/trading/TradeForm';
import { cn } from '@/lib/utils/cn';

function HoldingRow({ holding }: { holding: Holding }) {
  const { data: quote } = useStockQuote(holding.symbol);
  const [showTrade, setShowTrade] = useState(false);

  const currentPrice = quote?.price ?? 0;
  const marketValue = currentPrice > 0 ? holding.quantity * currentPrice : null;
  const pl = currentPrice > 0
    ? calculateUnrealizedPL(holding.quantity, holding.averageCost, currentPrice)
    : null;

  return (
    <>
      <tr className="border-t border-white/6 hover:bg-white/3 transition-colors">
        <td className="py-3 pr-4">
          <Link href={`/market/${holding.symbol}`} className="hover:text-indigo-300 transition-colors">
            <p className="text-sm font-semibold text-white">{holding.symbol}</p>
          </Link>
        </td>
        <td className="py-3 pr-4 text-sm text-gray-300 tabular-nums">
          {holding.quantity.toLocaleString()}
        </td>
        <td className="py-3 pr-4 text-sm text-gray-300 tabular-nums">
          {formatCurrency(holding.averageCost)}
        </td>
        <td className="py-3 pr-4 text-sm tabular-nums">
          {currentPrice > 0 ? (
            <span className="text-white">{formatCurrency(currentPrice)}</span>
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </td>
        <td className="py-3 pr-4 text-sm tabular-nums">
          {marketValue != null ? (
            <span className="text-white">{formatCurrency(marketValue)}</span>
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </td>
        <td className="py-3 pr-4 text-sm tabular-nums">
          {pl != null ? (
            <div>
              <span className={cn('font-medium', pl.amount >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {pl.amount >= 0 ? '+' : ''}{formatCurrency(pl.amount)}
              </span>
              <span className={cn('ml-1 text-xs', pl.percent >= 0 ? 'text-emerald-400/70' : 'text-red-400/70')}>
                ({formatPercent(pl.percent)})
              </span>
            </div>
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </td>
        <td className="py-3">
          <button
            onClick={() => setShowTrade(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Trade
          </button>
        </td>
      </tr>

      {showTrade && (
        <tr>
          <td colSpan={7}>
            <TradeForm symbol={holding.symbol} onClose={() => setShowTrade(false)} />
          </td>
        </tr>
      )}
    </>
  );
}

interface HoldingsTableProps {
  holdings: Holding[];
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  if (holdings.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            {['Symbol', 'Shares', 'Avg Cost', 'Price', 'Mkt Value', 'Unrealized P/L', ''].map((h) => (
              <th key={h} className="pb-2 pr-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <HoldingRow key={h.symbol} holding={h} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
