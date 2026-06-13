import Link from 'next/link';
import { StockSearchResult } from '@/types/market';
import { Badge } from '@/components/ui/Badge';

interface StockCardProps {
  result: StockSearchResult;
}

export function StockCard({ result }: StockCardProps) {
  return (
    <Link
      href={`/market/${result.symbol}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/6 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-indigo-400">
            {result.symbol.slice(0, 2)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
            {result.symbol}
          </p>
          <p className="text-xs text-gray-400 truncate">{result.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Badge variant="default">{result.type}</Badge>
        {result.exchange && (
          <span className="text-xs text-gray-500 hidden sm:block">{result.exchange}</span>
        )}
      </div>
    </Link>
  );
}
