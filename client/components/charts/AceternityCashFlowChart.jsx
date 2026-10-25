'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { Activity, BarChart2, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AceternityCashFlowChart({ data = [] }) {
  const [chartMode, setChartMode] = useState('wave'); // 'wave' | 'columns'
  const [timeRange, setTimeRange] = useState('all');   // 'all' | '6m' | '3m'
  const [hoveredData, setHoveredData] = useState(null);

  // Filter out trailing zero months (e.g., future months with 0 data)
  const activeMonthsData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const filtered = data.filter((d, i) => i <= currentMonthIdx || d.income > 0 || d.expense > 0);
    return filtered.length > 0 ? filtered : data;
  }, [data]);

  // Apply time range filter
  const displayData = useMemo(() => {
    if (timeRange === '3m') return activeMonthsData.slice(-3);
    if (timeRange === '6m') return activeMonthsData.slice(-6);
    return activeMonthsData;
  }, [activeMonthsData, timeRange]);

  // Current active data point for HUD (either hovered or the latest active month)
  const latestMonth = displayData[displayData.length - 1] || { month: 'Current', income: 0, expense: 0 };
  const currentHud = hoveredData || latestMonth;
  const currentNet = (currentHud.income || 0) - (currentHud.expense || 0);
  const currentRate = currentHud.income > 0 ? Math.round((currentNet / currentHud.income) * 100) : 0;

  // Custom live hover handler
  const handleMouseMove = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      setHoveredData(state.activePayload[0].payload);
    }
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] flex flex-col items-center justify-center text-xs text-muted-foreground">
        <Activity className="w-6 h-6 mb-2 opacity-25" />
        <p>No transaction history recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full select-none">
      {/* Live HUD Scrubber Header (Apple Card / Stripe Signature) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40 dark:border-white/[0.05] mb-4">
        {/* Left: Live Scrubber Readout */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              {hoveredData ? `${hoveredData.month} (Hovered)` : `${currentHud.month} (Latest)`}
            </span>
            <span className={cn(
              'text-[10px] font-mono px-2 py-0.5 rounded-full font-medium border',
              currentNet >= 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            )}>
              {currentRate}% saved
            </span>
          </div>

          <div className="flex items-baseline gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">In:</span>
              <span className="text-sm sm:text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrency(currentHud.income)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">Out:</span>
              <span className="text-sm sm:text-base font-bold font-mono text-rose-500 tabular-nums">
                -{formatCurrency(currentHud.expense)}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-border/40 dark:border-white/10">
              <span className="text-xs text-muted-foreground font-medium">Net:</span>
              <span className="text-sm sm:text-base font-bold font-mono text-foreground tabular-nums">
                {currentNet >= 0 ? '+' : ''}{formatCurrency(currentNet)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls (Range & Mode) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Time range pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.06]">
            {[
              { id: '3m', label: '3M' },
              { id: '6m', label: '6M' },
              { id: 'all', label: 'All' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setTimeRange(r.id)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-mono font-medium transition-all',
                  timeRange === r.id
                    ? 'bg-background shadow-xs text-foreground font-semibold dark:bg-white/10'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setChartMode('wave')}
              className={cn(
                'p-1.5 rounded-md transition-all',
                chartMode === 'wave'
                  ? 'bg-background shadow-xs text-foreground dark:bg-white/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Fluid Spline Wave"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartMode('columns')}
              className={cn(
                'p-1.5 rounded-md transition-all',
                chartMode === 'columns'
                  ? 'bg-background shadow-xs text-foreground dark:bg-white/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Modern Columns"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[220px] sm:h-[240px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'wave' ? (
            <AreaChart
              data={displayData}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id="aceternityIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                  <stop offset="60%" stopColor="#10b981" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="aceternityExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.20} />
                  <stop offset="60%" stopColor="#f43f5e" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground/80 font-medium"
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-muted-foreground/60 font-mono"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                dx={-4}
              />

              <Tooltip
                content={() => null} // Handled live in HUD header above for ultra-sleek UX
                cursor={{
                  stroke: 'currentColor',
                  strokeWidth: 1,
                  strokeDasharray: '3 3',
                  opacity: 0.2,
                }}
              />

              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#aceternityIncomeGrad)"
                dot={false}
                activeDot={{
                  r: 6,
                  strokeWidth: 3,
                  stroke: '#ffffff',
                  fill: '#10b981',
                  className: 'drop-shadow-md',
                }}
              />

              <Area
                type="monotone"
                dataKey="expense"
                name="Expenses"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#aceternityExpenseGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2.5,
                  stroke: '#ffffff',
                  fill: '#f43f5e',
                  className: 'drop-shadow-md',
                }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={displayData}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              barGap={6}
              barCategoryGap="24%"
              margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id="aceternityBarIncGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="aceternityBarExpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground/80 font-medium"
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-muted-foreground/60 font-mono"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                dx={-4}
              />

              <Tooltip content={() => null} cursor={{ fill: 'currentColor', opacity: 0.04 }} />

              <Bar
                dataKey="income"
                name="Income"
                fill="url(#aceternityBarIncGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill="url(#aceternityBarExpGrad)"
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
