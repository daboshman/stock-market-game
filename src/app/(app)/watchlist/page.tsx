import { PageHeader } from '@/components/layout/PageHeader';

export default function WatchlistPage() {
  return (
    <div>
      <PageHeader title="Watchlist" description="Stocks you're following" />
      <div className="bg-[#0f172a] border border-white/8 rounded-xl p-6 flex items-center justify-center h-48">
        <p className="text-gray-500 text-sm">Watchlist coming in Phase 5</p>
      </div>
    </div>
  );
}
