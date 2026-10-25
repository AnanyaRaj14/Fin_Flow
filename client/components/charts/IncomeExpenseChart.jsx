'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/70 dark:border-white/10 rounded-xl px-3 py-2 shadow-lg text-xs space-y-1 min-w-[120px]">
      <p className="font-medium text-foreground text-[11px] pb-1 border-b border-border/40 dark:border-white/10">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function IncomeExpenseChart({ data = [] }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-end pb-2 mb-2">
        <div className="flex items-center gap-3.5 text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Income
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80" />
            Expenses
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} barGap={4} barCategoryGap="28%" margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/20 dark:text-white/[0.03]" vertical={false} />
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.03 }} />
          <Bar dataKey="income" name="Income" fill="#34d399" radius={[3, 3, 0, 0]} maxBarSize={10} />
          <Bar dataKey="expense" name="Expenses" fill="rgba(244, 63, 94, 0.55)" radius={[3, 3, 0, 0]} maxBarSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
