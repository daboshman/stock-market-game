import { PageHeader } from '@/components/layout/PageHeader';

export default function PortfolioPage() {
  return (
    <div>
      <PageHeader title="Portfolio" description="Your holdings and allocation" />
      <div className="bg-[#0f172a] border border-white/8 rounded-xl p-6 flex items-center justify-center h-48">
        <p className="text-gray-500 text-sm">Holdings table coming in Phase 4</p>
      </div>
    </div>
  );
}
