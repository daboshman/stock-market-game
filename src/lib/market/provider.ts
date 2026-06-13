import { StockQuote, StockSearchResult, HistoryPoint, HistoryRange } from '@/types/market';

export interface MarketDataProvider {
  search(query: string): Promise<StockSearchResult[]>;
  getQuote(symbol: string): Promise<StockQuote>;
  getHistory(symbol: string, range: HistoryRange): Promise<HistoryPoint[]>;
}
