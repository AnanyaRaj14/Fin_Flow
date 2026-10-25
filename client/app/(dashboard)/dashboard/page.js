'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, Calendar,
  Receipt, CheckCircle2, ChevronRight, BarChart3, TrendingUp, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AceternityCashFlowChart from '@/components/charts/AceternityCashFlowChart';
import ExpensesByCategoryChart from '@/components/charts/ExpensesByCategoryChart';
import SavingsTrendChart from '@/components/charts/SavingsTrendChart';
import BudgetWarnings from '@/components/dashboard/BudgetWarnings';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { SkeletonCard } from '@/components/ui/skeleton';
import { dashboardApi } from '@/services/api';
import { formatCurrency, formatDate, getDaysUntilDue } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { currency, symbol, locale } = useCurrency();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState('cashflow'); // 'cashflow' | 'categories' | 'savings'

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([dashboardApi.getStats(), dashboardApi.getCharts(year)])
      .then(([s, c]) => {
        setStats(s.data);
        setCharts(c.data);
      })
      .catch(() => toast.error('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';
  const income = Number(stats?.totalIncome || 0);
  const expenses = Number(stats?.totalExpenses || 0);
  const savings = Number(stats?.totalSavings || 0);
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0;
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout title="Home">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6 max-w-6xl mx-auto pb-10"
      >
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8"><SkeletonCard /></div>
              <div className="lg:col-span-4"><SkeletonCard /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8"><SkeletonCard /></div>
              <div className="lg:col-span-4"><SkeletonCard /></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Row: Hero Net Worth (8 cols) + Monthly Performance (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Bento 1: Portfolio Net Worth Hero */}
              <SpotlightCard
                radius={450}
                spotlightColor="rgba(99, 102, 241, 0.12)"
                className="lg:col-span-8 p-4 sm:p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {greeting()}, {displayName}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground/75 px-2 py-0.5 rounded-md bg-muted/40 dark:bg-white/[0.03]">
                      {currentMonthName}
                    </span>
                  </div>

                  <div>
                    <NumberTicker
                      value={stats?.totalBalance ?? 0}
                      prefix={symbol}
                      locale={locale}
                      className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono tabular-nums"
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Total Portfolio Net Worth across all liquid & invested accounts
                  </p>
                </div>

                <div className="pt-3.5 flex items-center gap-2.5">
                  <Link href="/transactions/">
                    <ShimmerButton className="h-8 px-3.5 text-xs font-medium gap-1.5 shadow-xs">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Transaction</span>
                    </ShimmerButton>
                  </Link>
                  <Link href="/accounts/">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3.5 rounded-lg text-xs font-medium bg-white/70 dark:bg-white/[0.04] border-border/80 dark:border-white/10 hover:bg-accent/80 transition-all"
                    >
                      <Wallet className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                      <span>Accounts</span>
                    </Button>
                  </Link>
                </div>
              </SpotlightCard>

              {/* Bento 2: Monthly Cycle Performance */}
              <SpotlightCard
                radius={350}
                spotlightColor="rgba(99, 102, 241, 0.12)"
                className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border/40 dark:border-white/[0.05] mb-2.5">
                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase font-mono">
                      Monthly Cycle
                    </h3>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {savingsRate}% retention
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <ArrowDownLeft className="w-3.5 h-3.5 text-indigo-400" />
                        Monthly Inflow
                      </span>
                      <span className="font-mono font-semibold text-indigo-400 tabular-nums">
                        +{formatCurrency(income, currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                        Monthly Outflow
                      </span>
                      <span className="font-mono font-semibold text-muted-foreground tabular-nums">
                        -{formatCurrency(expenses, currency)}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-border/40 dark:border-white/[0.04] flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">Net Retained</span>
                      <span className="font-mono font-bold text-foreground tabular-nums text-xs">
                        {formatCurrency(savings, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Retention Gauge Bar */}
                <div className="pt-2.5">
                  <div className="w-full bg-muted/60 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(savingsRate, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground mt-1">
                    <span>Inflow</span>
                    <span>{savingsRate}% saved</span>
                    <span>Goal</span>
                  </div>
                </div>
              </SpotlightCard>
            </div>

            {/* Budget Warning Alert (if any) */}
            {stats?.budgets && <BudgetWarnings budgets={stats.budgets} />}

            {/* Middle Row: Visual Cash Flow Analytics (8 cols) + Recent Activity (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Bento 3: Financial Flow Analytics with Interactive HUD Scrubber */}
              <SpotlightCard
                radius={400}
                spotlightColor="rgba(99, 102, 241, 0.12)"
                className="lg:col-span-8 p-4 sm:p-6"
              >
                <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">Financial Flow</h3>
                  </div>

                  {/* Aceternity Sliding Pill Tab Switcher */}
                  <div className="relative flex items-center p-1 rounded-xl bg-muted/60 dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.06] overflow-x-auto max-w-full">
                    {[
                      { id: 'cashflow', label: 'Cash Flow' },
                      { id: 'categories', label: 'Categories' },
                      { id: 'savings', label: 'Trajectory' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveChartTab(tab.id)}
                        className={cn(
                          'relative px-3 py-1 text-xs font-medium transition-colors z-10',
                          activeChartTab === tab.id
                            ? 'text-foreground font-semibold dark:text-white'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {activeChartTab === tab.id && (
                          <motion.div
                            layoutId="chartActivePill"
                            className="absolute inset-0 rounded-lg bg-background shadow-xs dark:bg-white/10 border border-border/60 dark:border-white/10"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className="relative z-20">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {activeChartTab === 'cashflow' && (
                    <AceternityCashFlowChart data={charts?.monthlyData ?? []} currency={currency} />
                  )}
                  {activeChartTab === 'categories' && (
                    <ExpensesByCategoryChart data={charts?.expensesByCategory ?? []} currency={currency} />
                  )}
                  {activeChartTab === 'savings' && (
                    <SavingsTrendChart data={charts?.savingsTrend ?? []} currency={currency} />
                  )}
                </div>
              </SpotlightCard>

              {/* Bento 4: Recent Ledger Activity */}
              <SpotlightCard
                radius={350}
                spotlightColor="rgba(255, 255, 255, 0.08)"
                className="lg:col-span-4 p-4 sm:p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">Recent Activity</h3>
                    <Link href="/transactions/">
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                        <span>Ledger</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-1">
                    {(stats?.recentTransactions || []).length === 0 ? (
                      <div className="text-center py-10 text-xs text-muted-foreground">
                        No transactions recorded yet.
                      </div>
                    ) : (
                      (stats?.recentTransactions || []).slice(0, 5).map((tx) => {
                        const isIncome = tx.type === 'income';
                        return (
                          <div
                            key={tx.id}
                            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-accent/40 dark:hover:bg-white/[0.03] transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border bg-muted/40 dark:bg-white/[0.04] border-border/40 dark:border-white/[0.06] text-muted-foreground group-hover:text-foreground transition-all">
                              {isIncome ? (
                                <ArrowDownLeft className="w-3.5 h-3.5 text-indigo-400" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {tx.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {tx.category?.name || 'General'} · {formatDate(tx.date)}
                              </p>
                            </div>

                            <span
                              className={cn(
                                'text-xs font-mono font-bold tabular-nums shrink-0',
                                isIncome ? 'text-indigo-400' : 'text-foreground'
                              )}
                            >
                              {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-border/40 dark:border-white/[0.04]">
                  <Link href="/transactions/" className="w-full block">
                    <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground hover:text-foreground">
                      <span>View all transactions →</span>
                    </Button>
                  </Link>
                </div>
              </SpotlightCard>
            </div>

            {/* Bottom Row: Savings Goals (6 cols) + Upcoming Bills (6 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Bento 5: Savings Goals */}
              <SpotlightCard
                radius={350}
                spotlightColor="rgba(99, 102, 241, 0.12)"
                className="lg:col-span-6 p-4 sm:p-6"
              >
                <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">Savings Goals</h3>
                    <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-accent dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.06]">
                      {stats?.goals?.length ?? 0} active
                    </span>
                  </div>
                  <Link href="/goals/">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {(stats?.goals || []).length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No active savings goals. Create one in Goals.
                    </div>
                  ) : (
                    (stats?.goals || []).slice(0, 3).map((goal) => {
                      const pct = Math.min(100, Math.round((Number(goal.savedAmount || 0) / Number(goal.targetAmount || 1)) * 100));
                      return (
                        <div key={goal.id} className="space-y-1.5 p-2 rounded-xl hover:bg-accent/40 dark:hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground truncate">{goal.name}</span>
                            <span className="font-mono tabular-nums text-muted-foreground text-[11px]">
                              {formatCurrency(goal.savedAmount, currency)} / {formatCurrency(goal.targetAmount, currency)} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted/60 dark:bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </SpotlightCard>

              {/* Bento 6: Upcoming Commitments */}
              <SpotlightCard
                radius={350}
                spotlightColor="rgba(99, 102, 241, 0.1)"
                className="lg:col-span-6 p-4 sm:p-6"
              >
                <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">Upcoming Commitments</h3>
                  <Link href="/bills/">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-1">
                  {(stats?.upcomingBills || []).length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>No pending bills scheduled for this cycle</span>
                    </div>
                  ) : (
                    (stats?.upcomingBills || []).slice(0, 3).map((bill) => {
                      const days = getDaysUntilDue(bill.dueDate);
                      return (
                        <div
                          key={bill.id}
                          className="flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl hover:bg-accent/40 dark:hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-accent/60 dark:bg-white/[0.04] flex items-center justify-center text-muted-foreground border border-border/40 shrink-0">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{bill.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {days === 0 ? 'Due today' : `In ${days} days`}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold tabular-nums text-foreground shrink-0">
                            {formatCurrency(bill.amount, currency)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </SpotlightCard>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
