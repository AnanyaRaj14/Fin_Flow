'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Flame } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border/80 dark:border-white/10 rounded-xl p-3 shadow-xl text-xs space-y-1 min-w-[110px]">
      <p className="font-bold text-foreground">Day {label}</p>
      <p className="font-mono font-bold text-sm text-primary tabular-nums">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

export default function MonthlySpendingChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.amount || 0), 1);

  return (
    <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
      <CardHeader className="pb-2 border-b border-border/40 dark:border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">Daily Outflow Velocity</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Day-by-day expenditure distribution</p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Burn Rate
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 || data.every((d) => Number(d.amount || 0) === 0) ? (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
            No daily expense activity recorded for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40 dark:text-white/[0.04]" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={14}>
                {data.map((entry, i) => {
                  const isHigh = entry.amount >= max * 0.75;
                  return (
                    <Cell
                      key={i}
                      fill={isHigh ? '#f43f5e' : '#6366f1'}
                      className="transition-colors duration-200 hover:opacity-80"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
