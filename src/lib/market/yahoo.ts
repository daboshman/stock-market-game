import yahooFinance from 'yahoo-finance2';
import { MarketDataProvider } from './provider';
import { StockQuote, StockSearchResult, HistoryPoint, HistoryRange } from '@/types/market';

function rangeToStartDate(range: HistoryRange): Date {
  const now = new Date();
  switch (range) {
    case '1d':  return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    case '5d':  return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    case '1mo': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '3mo': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '6mo': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case '1y':  return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case '5y':  return new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
  }
}

function rangeToInterval(range: HistoryRange): '1d' | '1wk' | '1mo' {
  if (range === '5y') return '1wk';
  return '1d';
}

// yahoo-finance2 v3 uses overloaded generics that TypeScript can't narrow without explicit options.
// We cast to `any` at the boundary and immediately map to our own types.
/* eslint-disable @typescript-eslint/no-explicit-any */

export class YahooFinanceProvider implements MarketDataProvider {
  async search(query: string): Promise<StockSearchResult[]> {
    const result: any = await yahooFinance.search(query, {
      newsCount: 0,
      enableFuzzyQuery: false,
    } as any);

    return ((result.quotes ?? []) as any[])
      .filter((q: any) => q.symbol && (q.quoteType === 'EQUITY' || q.quoteType === 'ETF'))
      .slice(0, 10)
      .map((q: any) => ({
        symbol: q.symbol as string,
        name: q.shortname ?? q.longname ?? q.symbol,
        exchange: q.exchDisp ?? '',
        type: q.typeDisp ?? q.quoteType ?? 'EQUITY',
      }));
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const q: any = await yahooFinance.quote(symbol);

    return {
      symbol: q.symbol,
      name: q.longName ?? q.shortName ?? q.symbol,
      price: q.regularMarketPrice ?? 0,
      previousClose: q.regularMarketPreviousClose ?? 0,
      change: q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
      volume: q.regularMarketVolume ?? 0,
      marketCap: q.marketCap ?? null,
      currency: q.currency ?? 'USD',
      timestamp: (q.regularMarketTime as Date | undefined)?.getTime() ?? Date.now(),
    };
  }

  async getHistory(symbol: string, range: HistoryRange): Promise<HistoryPoint[]> {
    const period1 = rangeToStartDate(range);
    const interval = rangeToInterval(range);

    const rows: any[] = await yahooFinance.historical(symbol, {
      period1: period1.toISOString().split('T')[0],
      interval,
    } as any);

    return rows
      .filter((r: any) => r.close != null)
      .map((r: any) => ({
        date: (r.date as Date).toISOString().split('T')[0],
        open: r.open ?? 0,
        high: r.high ?? 0,
        low: r.low ?? 0,
        close: r.close ?? 0,
        volume: r.volume ?? 0,
      }));
  }
}
