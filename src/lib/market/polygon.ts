import { HistoryPoint, HistoryRange } from '@/types/market';

const BASE = 'https://api.polygon.io';

function key(): string {
  const k = process.env.POLYGON_API_KEY;
  if (!k) throw new Error('POLYGON_API_KEY not set');
  return k;
}

async function get<T>(path: string): Promise<T> {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}apiKey=${key()}`);
  if (!res.ok) throw new Error(`Polygon ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function rangeConfig(range: HistoryRange) {
  const to = new Date();
  const from = new Date(to);
  switch (range) {
    case '1d':  from.setDate(from.getDate() - 1);       return { from: isoDate(from), to: isoDate(to), multiplier: 1, timespan: 'hour' };
    case '5d':  from.setDate(from.getDate() - 5);       return { from: isoDate(from), to: isoDate(to), multiplier: 1, timespan: 'hour' };
    case '1mo': from.setMonth(from.getMonth() - 1);     return { from: isoDate(from), to: isoDate(to), multiplier: 1, timespan: 'day'  };
    case '3mo': from.setMonth(from.getMonth() - 3);     return { from: isoDate(from), to: isoDate(to), multiplier: 1, timespan: 'day'  };
    case '6mo': from.setMonth(from.getMonth() - 6);     return { from: isoDate(from), to: isoDate(to), multiplier: 1, timespan: 'day'  };
    case '1y':  from.setFullYear(from.getFullYear() - 1); return { from: isoDate(from), to: isoDate(to), multiplier: 1, timespan: 'day'  };
    case '5y':  from.setFullYear(from.getFullYear() - 5); return { from: isoDate(from), to: isoDate(to), multiplier: 1, timespan: 'week' };
  }
}

type PolygonAgg = { o: number; h: number; l: number; c: number; v: number; t: number };

export async function fetchPolygonHistory(symbol: string, range: HistoryRange): Promise<HistoryPoint[]> {
  const { from, to, multiplier, timespan } = rangeConfig(range);
  const path = `/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/${multiplier}/${timespan}/${from}/${to}`;

  const data = await get<{ results?: PolygonAgg[]; status: string }>(
    `${path}?adjusted=true&sort=asc&limit=5000`
  );

  if (!data.results?.length) return [];

  return data.results.map((r) => ({
    date: new Date(r.t).toISOString().split('T')[0],
    open:   r.o,
    high:   r.h,
    low:    r.l,
    close:  r.c,
    volume: r.v,
  }));
}
