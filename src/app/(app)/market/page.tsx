import { PageHeader } from '@/components/layout/PageHeader';

export default function MarketPage() {
  return (
    <div>
      <PageHeader title="Market" description="Search stocks and view quotes" />
      <div className="bg-[#0f172a] border border-white/8 rounded-xl p-6 flex items-center justify-center h-48">
        <p className="text-gray-500 text-sm">Stock search coming in Phase 3</p>
      </div>
    </div>
  );
}
