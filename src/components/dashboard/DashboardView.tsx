'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import { StatCard } from './StatCard';
import { PortfolioChart } from './PortfolioChart';
import { WatchlistPreview } from './WatchlistPreview';
import { RecentTransactions } from './RecentTransactions';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

export function DashboardView() {
  const { data: portfolio, isLoading } = usePortfolio();

  const cash = portfolio?.cashBalance ?? 0;
  const invested = portfolio?.totalInvested ?? 0;
  const total = cash + invested;
  const start = portfolio?.startingBalance ?? 100000;
  const pl = total - start;
  const plPct = start > 0 ? (pl / start) * 100 : 0;

  return (
    <div>
      <PageHeader title="Dashboard" description="Your portfolio overview" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Cash Balance"
          value={isLoading ? '—' : formatCurrency(cash)}
          isLoading={isLoading}
        />
        <StatCard
          label="Invested"
          value={isLoading ? '—' : formatCurrency(invested)}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Value"
          value={isLoading ? '—' : formatCurrency(total)}
          isLoading={isLoading}
        />
        <StatCard
          label="P/L vs Start"
          value={isLoading ? '—' : formatCurrency(pl)}
          sub={isLoading ? undefined : formatPercent(plPct)}
          subPositive={pl >= 0}
          isLoading={isLoading}
        />
      </div>

      {/* Chart + Watchlist row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card padding="lg" className="lg:col-span-2">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Portfolio Value</h2>
          <PortfolioChart />
        </Card>
        <Card padding="lg">
          <WatchlistPreview />
        </Card>
      </div>

      {/* Recent transactions */}
      <Card padding="lg">
        <RecentTransactions />
      </Card>
    </div>
  );
}
