import { YahooFinanceProvider } from './yahoo';
import type { MarketDataProvider } from './provider';

let _provider: MarketDataProvider | null = null;

export function getMarketProvider(): MarketDataProvider {
  if (!_provider) {
    _provider = new YahooFinanceProvider();
  }
  return _provider;
}
