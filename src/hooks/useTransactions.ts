'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getTransactions } from '@/lib/firebase/repositories/transactions';

export function useTransactions(pageSize = 20) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['transactions', user?.uid],
    queryFn: () => getTransactions(user!.uid, pageSize),
    enabled: !!user,
  });
}
