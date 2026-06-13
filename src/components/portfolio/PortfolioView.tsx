'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { HoldingsTable } from './HoldingsTable';
import { AllocationChart } from './AllocationChart';
import { useHoldings } from '@/hooks/useHoldings';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function StatSkeleton() {
  return <div className="h-12 bg-white/6 rounded-xl animate-pulse" />;
}

export function PortfolioView() {
  const { data: portfolio, isLoading: portfolioLoading, isError: portfolioError } = usePortfolio();
  const { data: holdings, isLoading: holdingsLoading, isError: holdingsError } = useHoldings();

  const isLoading = portfolioLoading || holdingsLoading;
  const isError = portfolioError || holdingsError;

  return (
    <div>
      <PageHeader title="Portfolio" description="Your holdings and allocation" />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} padding="md"><StatSkeleton /></Card>
          ))
        ) : portfolio ? (
          <>
            <Card padding="md">
              <p className="text-xs text-gray-400 mb-1">Cash</p>
              <p className="text-lg font-bold text-white tabular-nums">{formatCurrency(portfolio.cashBalance)}</p>
            </Card>
            <Card padding="md">
              <p className="text-xs text-gray-400 mb-1">Invested</p>
              <p className="text-lg font-bold text-white tabular-nums">{formatCurrency(portfolio.totalInvested)}</p>
            </Card>
            <Card padding="md" className="col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-400 mb-1">Total Value</p>
              <p className="text-lg font-bold text-white tabular-nums">
                {formatCurrency(portfolio.cashBalance + portfolio.totalInvested)}
              </p>
            </Card>
          </>
        ) : null}
      </div>

      {/* Holdings */}
      <Card padding="lg">
        <h2 className="text-sm font-semibold text-white mb-4">Holdings</h2>

        {isError && <ErrorState message="Failed to load portfolio data" />}

        {!isLoading && !isError && holdings?.length === 0 && (
          <EmptyState
            title="No holdings yet"
            description="Search for a stock and make your first simulated trade."
            icon="📈"
            action={
              <Link href="/market">
                <Button size="sm">Browse Market</Button>
              </Link>
            }
          />
        )}

        {!isLoading && !isError && holdings && holdings.length > 0 && (
          <HoldingsTable holdings={holdings} />
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-white/4 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
      </Card>

      {/* Allocation chart */}
      {!isLoading && holdings && holdings.length > 0 && (
        <Card padding="lg" className="mt-4">
          <h2 className="text-sm font-semibold text-white mb-4">Allocation by Cost Basis</h2>
          <AllocationChart />
        </Card>
      )}
    </div>
  );
}
