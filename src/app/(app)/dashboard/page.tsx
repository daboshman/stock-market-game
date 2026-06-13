import { PageHeader } from '@/components/layout/PageHeader';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your portfolio overview"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['Cash Balance', 'Invested', 'Total Value', "Today's P/L"].map((label) => (
          <div key={label} className="bg-[#0f172a] border border-white/8 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-semibold text-white">—</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0f172a] border border-white/8 rounded-xl p-6 flex items-center justify-center h-48">
        <p className="text-gray-500 text-sm">Portfolio chart coming in Phase 5</p>
      </div>
    </div>
  );
}
