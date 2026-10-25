'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency, getCurrencySymbol, cn } from '@/lib/utils';
import { Activity, BarChart2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  const inc = payload.find((p) => p.dataKey === 'income')?.value || 0;
  const exp = payload.find((p) => p.dataKey === 'expense')?.value || 0;
  const net = inc - exp;

  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border/80 dark:border-white/10 rounded-2xl p-3.5 shadow-xl text-xs space-y-2 min-w-[150px]">
      <div className="flex items-center justify-between pb-1.5 border-b border-border/40 dark:border-white/10">
        <span className="font-semibold text-foreground text-xs">{label}</span>
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Cash Flow</span>
      </div>
      <div className="space-y-1.5 font-mono text-[11px]">
        <div className="flex items-center justify-between gap-3 text-indigo-400">
          <span className="flex items-center gap-1.5 font-sans text-muted-foreground text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Inflow
          </span>
          <span className="font-semibold tabular-nums">+{formatCurrency(inc, currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-muted-foreground">
          <span className="flex items-center gap-1.5 font-sans text-muted-foreground text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            Outflow
          </span>
          <span className="font-semibold tabular-nums">-{formatCurrency(exp, currency)}</span>
        </div>
        <div className="pt-1.5 border-t border-border/40 dark:border-white/10 flex items-center justify-between gap-3 text-foreground font-semibold">
          <span className="font-sans text-[11px] text-muted-foreground">Net</span>
          <span className="tabular-nums text-foreground">
            {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function IncomeExpenseChart({ data = [], currency }) {
  const [chartMode, setChartMode] = useState('area'); // 'area' | 'bar'
  const symbol = getCurrencySymbol(currency);

  // Filter out trailing zero months so future empty months don't create empty dead space on the right
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    // Keep months up to current month, plus any month that actually has non-zero transactions
    const filtered = data.filter((d, i) => i <= currentMonthIdx || d.income > 0 || d.expense > 0);
    return filtered.length > 0 ? filtered : data;
  }, [data]);

  // Aggregate totals for the displayed cycle
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, d) => ({
        income: acc.income + (d.income || 0),
        expense: acc.expense + (d.expense || 0),
      }),
      { income: 0, expense: 0 }
    );
  }, [chartData]);

  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
        No transaction activity recorded for this period.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        {/* Metric Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <span className="text-muted-foreground text-[11px]">Inflow:</span>
            <span className="font-mono font-semibold text-indigo-400 tabular-nums text-xs">
              {formatCurrency(totals.income, currency)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
            <span className="text-muted-foreground text-[11px]">Outflow:</span>
            <span className="font-mono font-semibold text-muted-foreground tabular-nums text-xs">
              {formatCurrency(totals.expense, currency)}
            </span>
          </div>
        </div>

        {/* View Mode Toggle: Wave Curve vs Modern Columns */}
        <div className="flex items-center p-0.5 rounded-lg bg-muted/50 dark:bg-white/[0.04] border border-border/50 dark:border-white/[0.06] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('area')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
              chartMode === 'area'
                ? 'bg-background dark:bg-white/10 text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Smooth Flow Curve"
          >
            <Activity className="w-3 h-3" />
            <span>Smooth Flow</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('bar')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
              chartMode === 'bar'
                ? 'bg-background dark:bg-white/10 text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Monthly Columns"
          >
            <BarChart2 className="w-3 h-3" />
            <span>Columns</span>
          </button>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="currentColor"
                className="text-border/30 dark:text-white/[0.03]"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground font-medium"
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-muted-foreground/70 font-mono"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#incomeAreaGrad)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#6366f1' }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expenses"
                stroke="#94a3b8"
                strokeWidth={2}
                fill="url(#expenseAreaGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#94a3b8' }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={chartData}
              barGap={6}
              barCategoryGap="28%"
              margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="barIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="barExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="currentColor"
                className="text-border/30 dark:text-white/[0.03]"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground font-medium"
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-muted-foreground/70 font-mono"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'currentColor', opacity: 0.04 }} />
              <Bar
                dataKey="income"
                name="Income"
                fill="url(#barIncomeGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill="url(#barExpenseGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
