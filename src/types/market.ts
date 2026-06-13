export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number | null;
  currency: string;
  timestamp: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type HistoryRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';
