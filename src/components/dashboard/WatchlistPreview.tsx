'use client';

import Link from 'next/link';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useStockQuote } from '@/hooks/useStockQuote';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

function WatchlistRow({ symbol }: { symbol: string }) {
  const { data: quote, isLoading } = useStockQuote(symbol);

  if (isLoading) return <Skeleton className="h-10" />;

  const change = quote?.changePercent ?? 0;
  const isUp = change >= 0;

  return (
    <Link
      href={`/market/${symbol}`}
      className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-white/4 transition-colors"
    >
      <div>
        <p className="text-sm font-medium text-white">{symbol}</p>
        <p className="text-xs text-gray-500 truncate max-w-[140px]">{quote?.name ?? '—'}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white tabular-nums">
          {quote ? formatCurrency(quote.price) : '—'}
        </p>
        <p className={cn('text-xs tabular-nums', isUp ? 'text-emerald-400' : 'text-red-400')}>
          {quote ? formatPercent(change) : '—'}
        </p>
      </div>
    </Link>
  );
}

export function WatchlistPreview() {
  const { data: items, isLoading } = useWatchlist();
  const preview = items?.slice(0, 5) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Watchlist</h2>
        <Link href="/watchlist" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          Manage
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      )}

      {!isLoading && preview.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-500">No stocks in your watchlist</p>
          <Link href="/watchlist" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block">
            Add stocks →
          </Link>
        </div>
      )}

      {!isLoading && preview.length > 0 && (
        <div className="space-y-1">
          {preview.map((item) => (
            <WatchlistRow key={item.symbol} symbol={item.symbol} />
          ))}
        </div>
      )}
    </div>
  );
}
