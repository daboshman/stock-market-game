'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStockQuote } from '@/hooks/useStockQuote';
import { QuoteDisplay, QuoteDisplaySkeleton } from './QuoteDisplay';
import { PriceChart } from './PriceChart';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { TradeForm } from '@/components/trading/TradeForm';
import { TradeType } from '@/lib/trading/types';

interface StockDetailViewProps {
  symbol: string;
}

export function StockDetailView({ symbol }: StockDetailViewProps) {
  const { data: quote, isLoading, isError, refetch } = useStockQuote(symbol);
  const [tradeType, setTradeType] = useState<TradeType | null>(null);

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
              <Button size="lg" className="flex-1 sm:flex-none sm:w-36" onClick={() => setTradeType('BUY')}>
                Buy {symbol}
              </Button>
              <Button size="lg" variant="danger" className="flex-1 sm:flex-none sm:w-36" onClick={() => setTradeType('SELL')}>
                Sell {symbol}
              </Button>
            </div>
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

      {tradeType && (
        <TradeForm
          symbol={symbol}
          defaultType={tradeType}
          onClose={() => setTradeType(null)}
        />
      )}
    </div>
  );
}
