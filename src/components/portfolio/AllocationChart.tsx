'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useHoldings } from '@/hooks/useHoldings';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

const COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#f43f5e', '#3b82f6', '#a78bfa', '#34d399', '#fbbf24',
];

export function AllocationChart() {
  const { data: holdings, isLoading } = useHoldings();

  if (isLoading) {
    return <div className="h-52 animate-pulse bg-white/4 rounded-lg" />;
  }

  if (!holdings || holdings.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-sm text-gray-500">
        No holdings to display
      </div>
    );
  }

  const total = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const data = holdings.map((h) => ({
    name: h.symbol,
    value: h.totalCost,
    pct: total > 0 ? (h.totalCost / total) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: 12,
          }}
          formatter={(value, name, props) => [
            `${formatCurrency(Number(value))} (${formatPercent(props.payload.pct, false)})`,
            name,
          ]}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
