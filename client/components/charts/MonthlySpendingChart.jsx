'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { formatCurrency, getCurrencySymbol } from '@/lib/utils';
import { Flame } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border/80 dark:border-white/10 rounded-xl p-3 shadow-xl text-xs space-y-1 min-w-[110px]">
      <p className="font-bold text-foreground">Day {label}</p>
      <p className="font-mono font-bold text-sm text-primary tabular-nums">
        {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  );
};

export default function MonthlySpendingChart({ data = [], currency }) {
  const max = Math.max(...data.map((d) => d.amount || 0), 1);
  const symbol = getCurrencySymbol(currency);

  return (
    <SpotlightCard
      radius={380}
      spotlightColor="rgba(99, 102, 241, 0.12)"
      className="p-0 border border-border/80 dark:border-white/[0.08] dark:bg-[#121215]/80 backdrop-blur-md overflow-hidden"
    >
      <div className="p-4 pb-3 border-b border-border/40 dark:border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Daily Outflow Velocity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Day-by-day expenditure distribution</p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Burn Rate
          </span>
        </div>
      </div>
      <div className="p-4 pt-3">
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
                tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={14}>
                {data.map((entry, i) => {
                  const isHigh = entry.amount >= max * 0.75;
                  return (
                    <Cell
                      key={i}
                      fill={isHigh ? '#818cf8' : '#6366f1'}
                      className="transition-colors duration-200 hover:opacity-80"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </SpotlightCard>
  );
}
