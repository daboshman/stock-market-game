'use client';

import { useQuery } from '@tanstack/react-query';
import { StockQuote } from '@/types/market';

export function useStockQuote(symbol: string | null) {
  return useQuery<StockQuote>({
    queryKey: ['quote', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/market/quote/${symbol}`);
      if (!res.ok) throw new Error('Failed to fetch quote');
      return res.json();
    },
    enabled: !!symbol,
    refetchInterval: 60 * 1000,
  });
}
