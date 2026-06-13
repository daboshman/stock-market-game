'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getPortfolio } from '@/lib/firebase/repositories/portfolio';

export function usePortfolio() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['portfolio', user?.uid],
    queryFn: () => getPortfolio(user!.uid),
    enabled: !!user,
  });
}
