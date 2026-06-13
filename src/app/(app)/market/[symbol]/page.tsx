import { StockDetailView } from '@/components/market/StockDetailView';

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  return <StockDetailView symbol={params.symbol.toUpperCase()} />;
}
