import { FinnhubProvider } from './finnhub';
import type { MarketDataProvider } from './provider';

let _provider: MarketDataProvider | null = null;

export function getMarketProvider(): MarketDataProvider {
  if (!_provider) {
    _provider = new FinnhubProvider();
  }
  return _provider;
}
