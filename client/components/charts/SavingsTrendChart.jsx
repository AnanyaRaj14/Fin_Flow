'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/70 rounded-xl px-3 py-2 shadow-lg text-xs space-y-1 min-w-[120px]">
      <p className="font-semibold text-foreground text-[11px] pb-1 border-b border-border/40">{label}</p>
      <div className="flex items-center justify-between gap-3 text-[11px] pt-1">
        <span className="text-muted-foreground">Cumulative Savings</span>
        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatCurrency(payload[0].value)}
        </span>
      </div>
    </div>
  );
};

export default function SavingsTrendChart({ data = [] }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3 mb-2">
        <div>
          <h4 className="text-xs font-medium text-foreground tracking-tight">Savings Trajectory</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Cumulative monthly asset retention</p>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          {data.length} periods
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="90%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30 dark:text-white/[0.03]" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-muted-foreground"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'currentColor' }}
            className="text-muted-foreground font-mono"
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.3 }} />
          <Area
            type="monotone"
            dataKey="savings"
            name="Savings"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#savingsAreaGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
