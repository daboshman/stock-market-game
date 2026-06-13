import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMarketProvider } from '@/lib/market';
import { marketCache, TTL } from '@/lib/market/cache';

const querySchema = z.object({
  q: z.string().min(1).max(50),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = querySchema.safeParse({ q: searchParams.get('q') });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing or invalid query parameter q' }, { status: 400 });
  }

  const { q } = parsed.data;
  const cacheKey = `search:${q.toLowerCase()}`;

  const cached = marketCache.get<{ results: unknown[] }>(cacheKey);
  if (cached) {
    return NextResponse.json({ results: cached.data.results, cachedAt: cached.cachedAt });
  }

  try {
    const provider = getMarketProvider();
    const results = await provider.search(q);
    marketCache.set(cacheKey, { results }, TTL.SEARCH);
    return NextResponse.json({ results, cachedAt: Date.now() });
  } catch (err) {
    console.error('[market/search]', err);
    return NextResponse.json({ error: 'Failed to search market data' }, { status: 502 });
  }
}
