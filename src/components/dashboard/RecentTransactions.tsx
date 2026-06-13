'use client';

import Link from 'next/link';
import { useTransactions } from '@/hooks/useTransactions';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';

export function RecentTransactions() {
  const { data, isLoading } = useTransactions(5);
  const txs = data?.transactions;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
        <Link href="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          View all
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      )}

      {!isLoading && (!txs || txs.length === 0) && (
        <p className="text-sm text-gray-500 py-4 text-center">No transactions yet</p>
      )}

      {!isLoading && txs && txs.length > 0 && (
        <div className="space-y-1">
          {txs.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-white/4 transition-colors">
              <Badge variant={tx.type === 'BUY' ? 'green' : 'red'}>
                {tx.type}
              </Badge>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white">{tx.symbol}</span>
                <span className="text-xs text-gray-400 ml-2">{tx.quantity} shares @ {formatCurrency(tx.price)}</span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-white tabular-nums">{formatCurrency(tx.totalValue)}</p>
                <p className="text-xs text-gray-500">{tx.timestamp ? formatDateTime(tx.timestamp) : '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
