'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useSnapshots } from '@/hooks/useSnapshots';
import { formatCurrency } from '@/lib/utils/format';

function fmt(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PortfolioChart() {
  const { data: snapshots, isLoading } = useSnapshots(90);

  if (isLoading) {
    return <div className="h-52 animate-pulse bg-white/4 rounded-lg" />;
  }

  if (!snapshots || snapshots.length < 2) {
    return (
      <div className="h-52 flex items-center justify-center text-sm text-gray-500">
        Make trades to start tracking portfolio value over time
      </div>
    );
  }

  const chartData = snapshots.map((s) => ({
    t: fmt(s.timestamp),
    v: s.totalValue,
  }));

  const first = chartData[0].v;
  const last = chartData[chartData.length - 1].v;
  const isUp = last >= first;
  const color = isUp ? '#6366f1' : '#f43f5e';

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="t"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: 12,
          }}
          formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Portfolio Value']}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill="url(#portfolioGrad)"
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
