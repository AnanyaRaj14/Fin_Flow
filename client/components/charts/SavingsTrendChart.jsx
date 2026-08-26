'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border/80 dark:border-white/10 rounded-xl p-3 shadow-xl text-xs space-y-1 min-w-[120px]">
      <p className="font-bold text-foreground">{label}</p>
      <p className="font-mono font-bold text-sm text-primary tabular-nums">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

export default function SavingsTrendChart({ data = [] }) {
  return (
    <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
      <CardHeader className="pb-2 border-b border-border/40 dark:border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">Savings Growth Velocity</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Cumulative monthly asset retention</p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            Trajectory
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40 dark:text-white/[0.04]" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.4)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="savings"
              name="Savings"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#savingsAreaGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
