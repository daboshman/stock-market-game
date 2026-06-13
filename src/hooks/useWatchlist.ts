'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/firebase/repositories/watchlist';

export function useWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['watchlist', user?.uid],
    queryFn: () => getWatchlist(user!.uid),
    enabled: !!user,
  });

  const add = useMutation({
    mutationFn: (symbol: string) => addToWatchlist(user!.uid, symbol),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist', user?.uid] }),
  });

  const remove = useMutation({
    mutationFn: (symbol: string) => removeFromWatchlist(user!.uid, symbol),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist', user?.uid] }),
  });

  return { ...query, add, remove };
}
