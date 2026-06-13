import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMarketProvider } from '@/lib/market';
import { marketCache, TTL } from '@/lib/market/cache';
import { HistoryPoint, HistoryRange } from '@/types/market';

const paramsSchema = z.object({
  symbol: z.string().min(1).max(10).regex(/^[A-Z0-9.\-^]+$/i),
  range: z.enum(['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y']).default('3mo'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const range = request.nextUrl.searchParams.get('range') ?? '3mo';
  const parsed = paramsSchema.safeParse({ symbol: params.symbol, range });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid symbol or range' }, { status: 400 });
  }

  const { symbol, range: validRange } = parsed.data;
  const upperSymbol = symbol.toUpperCase();
  const cacheKey = `history:${upperSymbol}:${validRange}`;

  const cached = marketCache.get<HistoryPoint[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ history: cached.data, cachedAt: cached.cachedAt });
  }

  try {
    const provider = getMarketProvider();
    const history = await provider.getHistory(upperSymbol, validRange as HistoryRange);
    marketCache.set(cacheKey, history, TTL.HISTORY);
    return NextResponse.json({ history, cachedAt: Date.now() });
  } catch (err) {
    console.error(`[market/history/${upperSymbol}]`, err);
    return NextResponse.json({ error: `Could not fetch history for ${upperSymbol}` }, { status: 502 });
  }
}
