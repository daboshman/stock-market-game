import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
  isLoading?: boolean;
}

export function StatCard({ label, value, sub, subPositive, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#0f172a] border border-white/8 rounded-xl p-4">
        <div className="h-3 w-20 bg-white/8 rounded animate-pulse mb-2" />
        <div className="h-6 w-32 bg-white/8 rounded animate-pulse" />
        <div className="h-3 w-16 bg-white/6 rounded animate-pulse mt-1.5" />
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border border-white/8 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-semibold text-white tabular-nums">{value}</p>
      {sub && (
        <p className={cn('text-xs mt-0.5 tabular-nums', subPositive ? 'text-emerald-400' : 'text-red-400')}>
          {sub}
        </p>
      )}
    </div>
  );
}
