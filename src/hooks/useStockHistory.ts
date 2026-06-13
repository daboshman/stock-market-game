'use client';

import { useQuery } from '@tanstack/react-query';
import { HistoryPoint, HistoryRange } from '@/types/market';

export function useStockHistory(symbol: string | null, range: HistoryRange = '3mo') {
  return useQuery<{ history: HistoryPoint[]; cachedAt: number }>({
    queryKey: ['history', symbol, range],
    queryFn: async () => {
      const res = await fetch(`/api/market/history/${symbol}?range=${range}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    },
    enabled: !!symbol,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
