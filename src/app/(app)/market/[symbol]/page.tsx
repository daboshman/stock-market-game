import { PageHeader } from '@/components/layout/PageHeader';

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  return (
    <div>
      <PageHeader title={params.symbol.toUpperCase()} description="Stock detail" />
      <div className="bg-[#0f172a] border border-white/8 rounded-xl p-6 flex items-center justify-center h-48">
        <p className="text-gray-500 text-sm">Quote + chart + trade form coming in Phase 3 & 4</p>
      </div>
    </div>
  );
}
