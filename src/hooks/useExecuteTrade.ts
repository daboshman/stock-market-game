'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { TradeResult, TradeType } from '@/lib/trading/types';

interface ExecuteTradeVars {
  symbol: string;
  type: TradeType;
  quantity: number;
}

export function useExecuteTrade() {
  const queryClient = useQueryClient();

  return useMutation<TradeResult, Error, ExecuteTradeVars>({
    mutationFn: async ({ symbol, type, quantity }) => {
      const auth = getFirebaseAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('You must be signed in to trade');

      const res = await fetch('/api/portfolio/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ symbol, type, quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Trade failed');
      return data as TradeResult;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.symbol] });
    },
  });
}
