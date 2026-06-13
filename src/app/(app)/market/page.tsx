import { PageHeader } from '@/components/layout/PageHeader';
import { StockSearch } from '@/components/market/StockSearch';

const POPULAR = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
];

export default function MarketPage() {
  return (
    <div>
      <PageHeader title="Market" description="Search stocks and view real-time quotes" />
      <StockSearch />

      <div className="mt-8">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Popular</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {POPULAR.map((s) => (
            <a
              key={s.symbol}
              href={`/market/${s.symbol}`}
              className="flex items-center gap-2 p-3 bg-[#0f172a] border border-white/8 rounded-xl hover:border-indigo-500/30 hover:bg-indigo-600/5 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-indigo-600/15 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-indigo-400">{s.symbol.slice(0, 2)}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{s.symbol}</p>
                <p className="text-xs text-gray-500 truncate">{s.name}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
