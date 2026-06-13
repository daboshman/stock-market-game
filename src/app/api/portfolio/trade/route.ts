import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';

import { getMarketProvider } from '@/lib/market';

export const dynamic = 'force-dynamic';
import { executeBuy, executeSell } from '@/lib/trading/engine';
import { TradeError } from '@/lib/trading/types';

const tradeSchema = z.object({
  symbol: z.string().min(1).max(10).regex(/^[A-Z0-9.\-^]+$/i),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().int().min(1).max(10_000),
});

export async function POST(request: NextRequest) {
  // Verify auth
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.replace('Bearer ', '');

  if (!idToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = tradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { symbol, type, quantity } = parsed.data;
  const upperSymbol = symbol.toUpperCase();

  // Fetch live price server-side (client cannot set the price)
  let price: number;
  try {
    const provider = getMarketProvider();
    const quote = await provider.getQuote(upperSymbol);
    price = quote.price;
    if (!price || price <= 0) throw new Error('Invalid price');
  } catch {
    return NextResponse.json({ error: `Could not fetch current price for ${upperSymbol}` }, { status: 502 });
  }

  // Execute trade
  try {
    const result = type === 'BUY'
      ? await executeBuy(userId, upperSymbol, quantity, price)
      : await executeSell(userId, upperSymbol, quantity, price);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof TradeError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 422 });
    }
    console.error('[portfolio/trade]', err);
    return NextResponse.json({ error: 'Trade execution failed' }, { status: 500 });
  }
}
