'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { StockCard } from './StockCard';
import { Spinner } from '@/components/ui/Spinner';
import { StockSearchResult } from '@/types/market';

export function StockSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, isError } = useQuery<{ results: StockSearchResult[] }>({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: debouncedQuery.length >= 1,
    staleTime: 5 * 60 * 1000,
  });

  const results = data?.results ?? [];

  return (
    <div>
      <div className="relative mb-4">
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
          placeholder="Search stocks by symbol or name..."
          className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          autoFocus
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {debouncedQuery.length >= 1 && (
        <div className="bg-[#0f172a] border border-white/8 rounded-xl overflow-hidden">
          {isError && (
            <p className="text-sm text-red-400 px-4 py-3">Search failed. Try again.</p>
          )}
          {!isLoading && !isError && results.length === 0 && (
            <p className="text-sm text-gray-400 px-4 py-3">
              No results found for &ldquo;{debouncedQuery}&rdquo;
            </p>
          )}
          {results.map((result) => (
            <StockCard key={result.symbol} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
