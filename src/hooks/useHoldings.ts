'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getHoldings } from '@/lib/firebase/repositories/holdings';

export function useHoldings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['holdings', user?.uid],
    queryFn: () => getHoldings(user!.uid),
    enabled: !!user,
  });
}
