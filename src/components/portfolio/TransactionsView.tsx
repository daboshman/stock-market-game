'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import Link from 'next/link';

export function TransactionsView() {
  const { data, isLoading, isError, refetch } = useTransactions(50);
  const transactions = data?.transactions ?? [];

  return (
    <div>
      <PageHeader title="Transactions" description="Your complete trade history" />

      <Card padding="none">
        {isError && (
          <div className="p-6">
            <ErrorState message="Failed to load transactions" retry={refetch} />
          </div>
        )}

        {isLoading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/4 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !isError && transactions.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="No trades yet"
              description="Your completed trades will appear here."
              icon="⇄"
            />
          </div>
        )}

        {!isLoading && !isError && transactions.length > 0 && (
          <div className="divide-y divide-white/6">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant={tx.type === 'BUY' ? 'green' : 'red'}>
                    {tx.type}
                  </Badge>
                  <div>
                    <Link
                      href={`/market/${tx.symbol}`}
                      className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors"
                    >
                      {tx.symbol}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tx.quantity} share{tx.quantity !== 1 ? 's' : ''} @ {formatCurrency(tx.price)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold tabular-nums ${tx.type === 'BUY' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tx.type === 'BUY' ? '-' : '+'}{formatCurrency(tx.totalValue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tx.timestamp ? formatDateTime(tx.timestamp) : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
