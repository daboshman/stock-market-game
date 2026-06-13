'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useStockQuote } from '@/hooks/useStockQuote';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import { StockSearchResult } from '@/types/market';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

function WatchlistRow({ symbol, onRemove }: { symbol: string; onRemove: () => void }) {
  const { data: quote, isLoading } = useStockQuote(symbol);
  const change = quote?.changePercent ?? 0;
  const isUp = change >= 0;

  return (
    <div className="flex items-center gap-3 px-5 py-4 hover:bg-white/3 transition-colors">
      <div className="flex-1 min-w-0">
        <Link
          href={`/market/${symbol}`}
          className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors"
        >
          {symbol}
        </Link>
        {isLoading ? (
          <Skeleton className="h-3 w-32 mt-1" />
        ) : (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{quote?.name ?? '—'}</p>
        )}
      </div>

      <div className="text-right mr-4">
        {isLoading ? (
          <Skeleton className="h-4 w-20" />
        ) : (
          <>
            <p className="text-sm font-medium text-white tabular-nums">
              {quote ? formatCurrency(quote.price) : '—'}
            </p>
            <p className={cn('text-xs tabular-nums', isUp ? 'text-emerald-400' : 'text-red-400')}>
              {quote ? formatPercent(change) : '—'}
            </p>
          </>
        )}
      </div>

      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none px-1"
        title="Remove from watchlist"
      >
        ×
      </button>
    </div>
  );
}

function SearchResult({
  result,
  isAdded,
  onAdd,
}: {
  result: StockSearchResult;
  isAdded: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/4 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{result.symbol}</p>
        <p className="text-xs text-gray-400 truncate">{result.name}</p>
      </div>
      <Button
        size="sm"
        variant={isAdded ? 'secondary' : 'primary'}
        onClick={onAdd}
        disabled={isAdded}
      >
        {isAdded ? 'Added' : '+ Add'}
      </Button>
    </div>
  );
}

export function WatchlistView() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data: items, isLoading: listLoading, add, remove } = useWatchlist();

  const { data: searchData, isLoading: searchLoading } = useQuery<{ results: StockSearchResult[] }>({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: debouncedQuery.length >= 1,
    staleTime: 5 * 60 * 1000,
  });

  const watchedSymbols = new Set(items?.map((i) => i.symbol) ?? []);
  const searchResults = searchData?.results ?? [];

  return (
    <div>
      <PageHeader title="Watchlist" description="Stocks you're following" />

      {/* Search to add */}
      <Card padding="md" className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks to add to watchlist..."
            className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          {searchLoading && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        {debouncedQuery.length >= 1 && searchResults.length > 0 && (
          <div className="mt-2 border border-white/8 rounded-xl overflow-hidden">
            {searchResults.map((result) => (
              <SearchResult
                key={result.symbol}
                result={result}
                isAdded={watchedSymbols.has(result.symbol)}
                onAdd={() => {
                  if (user) add.mutate(result.symbol);
                  setQuery('');
                }}
              />
            ))}
          </div>
        )}

        {debouncedQuery.length >= 1 && !searchLoading && searchResults.length === 0 && (
          <p className="text-sm text-gray-400 mt-2 px-1">No results for &ldquo;{debouncedQuery}&rdquo;</p>
        )}
      </Card>

      {/* Watchlist */}
      <Card padding="none">
        <div className="px-5 py-3 border-b border-white/6">
          <h2 className="text-sm font-semibold text-white">
            Your Watchlist
            {items && items.length > 0 && (
              <span className="ml-2 text-xs text-gray-500 font-normal">{items.length} stocks</span>
            )}
          </h2>
        </div>

        {listLoading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        )}

        {!listLoading && (!items || items.length === 0) && (
          <div className="p-6">
            <EmptyState
              title="Your watchlist is empty"
              description="Search for stocks above to start tracking them."
              icon="★"
            />
          </div>
        )}

        {!listLoading && items && items.length > 0 && (
          <div className="divide-y divide-white/6">
            {items.map((item) => (
              <WatchlistRow
                key={item.symbol}
                symbol={item.symbol}
                onRemove={() => remove.mutate(item.symbol)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
