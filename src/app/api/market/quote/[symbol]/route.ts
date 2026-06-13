import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMarketProvider } from '@/lib/market';
import { marketCache, TTL } from '@/lib/market/cache';
import { StockQuote } from '@/types/market';

const symbolSchema = z.string().min(1).max(10).regex(/^[A-Z0-9.\-^]+$/i);

export async function GET(
  _request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const parsed = symbolSchema.safeParse(params.symbol);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  const symbol = parsed.data.toUpperCase();
  const cacheKey = `quote:${symbol}`;

  const cached = marketCache.get<StockQuote>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached.data, cachedAt: cached.cachedAt });
  }

  try {
    const provider = getMarketProvider();
    const quote = await provider.getQuote(symbol);
    marketCache.set(cacheKey, quote, TTL.QUOTE);
    return NextResponse.json({ ...quote, cachedAt: Date.now() });
  } catch (err) {
    console.error(`[market/quote/${symbol}]`, err);
    return NextResponse.json({ error: `Could not fetch quote for ${symbol}` }, { status: 502 });
  }
}
