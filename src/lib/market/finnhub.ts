import { MarketDataProvider } from './provider';
import { StockQuote, StockSearchResult, HistoryPoint, HistoryRange } from '@/types/market';

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

function rangeParams(range: HistoryRange): { from: number; resolution: string } {
  const now = Math.floor(Date.now() / 1000);
  const d = 86400;
  switch (range) {
    case '1d':  return { from: now - d,          resolution: '60' };
    case '5d':  return { from: now - 5 * d,      resolution: '60' };
    case '1mo': return { from: now - 30 * d,     resolution: 'D'  };
    case '3mo': return { from: now - 90 * d,     resolution: 'D'  };
    case '6mo': return { from: now - 180 * d,    resolution: 'D'  };
    case '1y':  return { from: now - 365 * d,    resolution: 'D'  };
    case '5y':  return { from: now - 5 * 365 * d, resolution: 'W' };
  }
}

export class FinnhubProvider implements MarketDataProvider {
  async search(query: string): Promise<StockSearchResult[]> {
    const data = await get<{
      result: Array<{ symbol: string; description: string; type: string }>;
    }>(`/search?q=${encodeURIComponent(query)}`);

    return (data.result ?? [])
      .filter((r) => r.type === 'Common Stock' || r.type === 'ETP')
      .slice(0, 10)
      .map((r) => ({
        symbol: r.symbol,
        name: r.description,
        exchange: '',
        type: r.type === 'ETP' ? 'ETF' : 'EQUITY',
      }));
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
    const now = Math.floor(Date.now() / 1000);
    const { from, resolution } = rangeParams(range);

    const data = await get<{
      s: string;
      t: number[]; o: number[]; h: number[];
      l: number[]; c: number[]; v: number[];
    }>(`/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${now}`);

    if (data.s !== 'ok' || !data.t?.length) return [];

    return data.t.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open:   data.o[i] ?? 0,
      high:   data.h[i] ?? 0,
      low:    data.l[i] ?? 0,
      close:  data.c[i] ?? 0,
      volume: data.v[i] ?? 0,
    }));
  }
}
