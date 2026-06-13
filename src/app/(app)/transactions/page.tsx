import { PageHeader } from '@/components/layout/PageHeader';

export default function TransactionsPage() {
  return (
    <div>
      <PageHeader title="Transactions" description="Your trade history" />
      <div className="bg-[#0f172a] border border-white/8 rounded-xl p-6 flex items-center justify-center h-48">
        <p className="text-gray-500 text-sm">Transaction list coming in Phase 4</p>
      </div>
    </div>
  );
}
