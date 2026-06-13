'use client';

import { StockQuote } from '@/types/market';
import { formatCurrency, formatPercent, formatCompact } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface QuoteDisplayProps {
  quote: StockQuote & { cachedAt?: number };
}

export function QuoteDisplay({ quote }: QuoteDisplayProps) {
  const isPositive = quote.change >= 0;
  const ageSeconds = quote.cachedAt ? Math.floor((Date.now() - quote.cachedAt) / 1000) : 0;
  const isStale = ageSeconds > 60;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white">{quote.symbol}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{quote.name}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white tabular-nums">
            {formatCurrency(quote.price)}
          </p>
          <p className={cn('text-sm font-medium mt-0.5', isPositive ? 'text-emerald-400' : 'text-red-400')}>
            {isPositive ? '+' : ''}{formatCurrency(quote.change)}{' '}
            ({formatPercent(quote.changePercent)})
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div>
          <span className="text-gray-500">Prev Close </span>
          <span className="text-gray-300">{formatCurrency(quote.previousClose)}</span>
        </div>
        {quote.volume > 0 && (
          <div>
            <span className="text-gray-500">Volume </span>
            <span className="text-gray-300">{formatCompact(quote.volume)}</span>
          </div>
        )}
        {quote.marketCap && (
          <div>
            <span className="text-gray-500">Mkt Cap </span>
            <span className="text-gray-300">{formatCompact(quote.marketCap)}</span>
          </div>
        )}
        <div>
          <span className="text-gray-500">Currency </span>
          <span className="text-gray-300">{quote.currency}</span>
        </div>
        {isStale && (
          <div className="ml-auto">
            <span className="text-xs text-yellow-500/80">
              Data {ageSeconds}s old
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuoteDisplaySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="h-9 w-24 bg-white/10 rounded-lg mb-2" />
          <div className="h-4 w-40 bg-white/6 rounded" />
        </div>
        <div className="text-right">
          <div className="h-9 w-32 bg-white/10 rounded-lg mb-2" />
          <div className="h-4 w-24 bg-white/6 rounded ml-auto" />
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 w-24 bg-white/6 rounded" />
        ))}
      </div>
    </div>
  );
}
