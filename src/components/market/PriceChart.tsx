'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useStockHistory } from '@/hooks/useStockHistory';
import { HistoryRange } from '@/types/market';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const RANGES: { label: string; value: HistoryRange }[] = [
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
];

interface PriceChartProps {
  symbol: string;
  isPositive: boolean;
}

function formatXAxisDate(dateStr: string, range: HistoryRange): string {
  const d = new Date(dateStr);
  if (range === '5y') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PriceChart({ symbol, isPositive }: PriceChartProps) {
  const [range, setRange] = useState<HistoryRange>('3mo');
  const { data, isLoading, isError } = useStockHistory(symbol, range);

  const color = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400">Price History</h2>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'px-3 py-1 text-xs rounded-lg transition-colors',
                range === r.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/8'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <ChartSkeleton />}

      {isError && (
        <div className="h-52 flex items-center justify-center text-sm text-gray-500">
          Failed to load chart data
        </div>
      )}

      {data && data.history.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.history} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatXAxisDate(v, range)}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: 12,
              }}
              formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Close']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fill="url(#priceGrad)"
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {data && data.history.length === 0 && (
        <div className="h-52 flex items-center justify-center text-sm text-gray-500">
          No data available for this range
        </div>
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-52 animate-pulse bg-white/4 rounded-lg" />
  );
}
