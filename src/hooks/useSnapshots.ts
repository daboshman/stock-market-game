'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getSnapshots } from '@/lib/firebase/repositories/snapshots';

export function useSnapshots(count = 90) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['snapshots', user?.uid, count],
    queryFn: () => getSnapshots(user!.uid, count),
    enabled: !!user,
    staleTime: 30_000,
  });
}
