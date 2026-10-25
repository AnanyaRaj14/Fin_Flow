'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/70 rounded-xl px-3 py-2 shadow-lg text-xs space-y-1 min-w-[120px]">
      <p className="font-semibold text-foreground text-[11px] pb-1 border-b border-border/40">{label}</p>
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
      <div className="flex items-center justify-between pb-3 mb-2">
        <div>
          <h4 className="text-xs font-medium text-foreground tracking-tight">Monthly Inflow vs Outflow</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Net cash movements across cycles</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-xs bg-emerald-500" />
            Income
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-xs bg-rose-500" />
            Expenses
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.03 }} />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={20} />
          <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
