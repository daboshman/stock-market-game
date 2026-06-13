import { MarketDataProvider } from './provider';
import { StockQuote, StockSearchResult, HistoryPoint, HistoryRange } from '@/types/market';
import { fetchPolygonHistory, fetchPolygonSearch } from './polygon';

const BASE = 'https://finnhub.io/api/v1';

function key() {
  const k = process.env.FINNHUB_API_KEY;
  if (!k) throw new Error('FINNHUB_API_KEY not set');
  return k;
}

async function get<T>(path: string): Promise<T> {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}token=${key()}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'StockGame/1.0' } });
  if (!res.ok) throw new Error(`Finnhub ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}


export class FinnhubProvider implements MarketDataProvider {
  async search(query: string): Promise<StockSearchResult[]> {
    // Finnhub search returns international markets (e.g. TEVA.TA) mixed with US stocks.
    // Polygon filtered to locale=us gives clean US-only results including ADRs.
    return fetchPolygonSearch(query);
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const q = await get<{
      c: number; d: number; dp: number; h: number;
      l: number; o: number; pc: number; t: number;
    }>(`/quote?symbol=${encodeURIComponent(symbol)}`);

    const price = q.c || q.pc;
    if (!price) throw new Error(`No data found for "${symbol}"`);

    return {
      symbol,
      name: symbol,
      price,
      previousClose: q.pc,
      change: q.d ?? 0,
      changePercent: q.dp ?? 0,
      volume: 0,
      marketCap: null,
      currency: 'USD',
      timestamp: (q.t || Math.floor(Date.now() / 1000)) * 1000,
    };
  }

  async getHistory(symbol: string, range: HistoryRange): Promise<HistoryPoint[]> {
    // Finnhub free plan does not include /stock/candle — delegate to Polygon.io
    return fetchPolygonHistory(symbol, range);
  }
}
