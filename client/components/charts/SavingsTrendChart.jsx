'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/70 dark:border-white/10 rounded-xl px-3 py-2 shadow-lg text-xs space-y-1 min-w-[130px]">
      <p className="font-semibold text-foreground text-[11px] pb-1 border-b border-border/40 dark:border-white/10">{label}</p>
      <div className="flex items-center justify-between gap-3 text-[11px] pt-1">
        <span className="text-muted-foreground">Cumulative Savings</span>
        <span className="font-mono font-semibold tabular-nums text-foreground">
          {formatCurrency(payload[0].value)}
        </span>
      </div>
    </div>
  );
};

export default function SavingsTrendChart({ data = [] }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const filtered = data.filter((d, i) => i <= currentMonthIdx || d.savings > 0);
    return filtered.length > 0 ? filtered : data;
  }, [data]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-end pb-2 mb-2">
        <span className="text-[11px] font-mono text-muted-foreground">
          {chartData.length} active periods
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.20} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="currentColor" className="text-border/30 dark:text-white/[0.03]" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-muted-foreground font-medium"
            axisLine={false}
            tickLine={false}
            dy={4}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'currentColor' }}
            className="text-muted-foreground/70 font-mono"
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.15 }} />
          <Area
            type="monotone"
            dataKey="savings"
            name="Savings"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#savingsAreaGradient)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#10b981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
