'use client';

import Link from 'next/link';
import { useStockQuote } from '@/hooks/useStockQuote';
import { QuoteDisplay, QuoteDisplaySkeleton } from './QuoteDisplay';
import { PriceChart } from './PriceChart';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';

interface StockDetailViewProps {
  symbol: string;
}

export function StockDetailView({ symbol }: StockDetailViewProps) {
  const { data: quote, isLoading, isError, refetch } = useStockQuote(symbol);

  return (
    <div>
      <div className="mb-4">
        <Link href="/market" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Market
        </Link>
      </div>

      <Card className="mb-4">
        {isLoading && <QuoteDisplaySkeleton />}
        {isError && (
          <ErrorState
            title="Could not load quote"
            message={`No data found for "${symbol}". Check the symbol and try again.`}
            retry={refetch}
          />
        )}
        {quote && (
          <div>
            <QuoteDisplay quote={quote} />
            <div className="mt-5 flex gap-3">
              <Button size="lg" className="flex-1 sm:flex-none sm:w-36">
                Buy {symbol}
              </Button>
              <Button size="lg" variant="secondary" className="flex-1 sm:flex-none sm:w-36">
                Sell {symbol}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Trading opens in Phase 4. Add to{' '}
              <Link href="/watchlist" className="text-indigo-400 hover:underline">
                watchlist
              </Link>{' '}
              for now.
            </p>
          </div>
        )}
      </Card>

      {(quote || isLoading) && (
        <Card>
          <PriceChart
            symbol={symbol}
            isPositive={!quote || quote.change >= 0}
          />
        </Card>
      )}
    </div>
  );
}
