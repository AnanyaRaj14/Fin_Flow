'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, Calendar,
  Receipt, CheckCircle2, ChevronRight, BarChart3, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import ExpensesByCategoryChart from '@/components/charts/ExpensesByCategoryChart';
import SavingsTrendChart from '@/components/charts/SavingsTrendChart';
import BudgetWarnings from '@/components/dashboard/BudgetWarnings';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { dashboardApi } from '@/services/api';
import { formatCurrency, formatDate, getDaysUntilDue } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
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

  return (
    <DashboardLayout title="Home">
      <div className="space-y-6 max-w-6xl mx-auto pb-10">

        {/* Aceternity Hero Master Card */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Net Worth Card with Aceternity Radiant Halo */}
            <SpotlightCard
              radius={450}
              spotlightColor="rgba(99, 102, 241, 0.15)"
              className="p-6 sm:p-7"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold tracking-wider uppercase text-[10px] text-foreground/80">
                      Portfolio Overview
                    </span>
                    <span>·</span>
                    <span className="font-mono text-[11px]">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-muted-foreground">
                    {greeting()}, {displayName}
                  </p>
                  
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight font-mono tabular-nums text-foreground">
                      {formatCurrency(stats?.totalBalance ?? 0)}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent dark:bg-white/[0.06] text-muted-foreground border border-border/40 dark:border-white/[0.06]">
                      net worth
                    </span>
                  </div>
                </div>

                {/* Quick Actions with Aceternity Shimmer Button */}
                <div className="flex items-center gap-2.5">
                  <Link href="/transactions" prefetch={false}>
                    <ShimmerButton className="h-8.5 px-4 text-xs font-semibold gap-1.5 shadow-md">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Transaction</span>
                    </ShimmerButton>
                  </Link>
                  <Link href="/accounts" prefetch={false}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8.5 px-3.5 rounded-xl text-xs font-semibold bg-white/60 dark:bg-white/[0.04] border-border/80 dark:border-white/10 hover:bg-accent/80 transition-all"
                    >
                      <Wallet className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                      <span>Accounts</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </SpotlightCard>

            {/* 3 Bento Metrics Cards with Custom Halos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Monthly Inflow */}
              <SpotlightCard
                radius={280}
                spotlightColor="rgba(16, 185, 129, 0.16)"
                className="p-5"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">
                    Monthly Inflow
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-2.5 tracking-tight">
                  +{formatCurrency(income)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Cash received this cycle</p>
              </SpotlightCard>

              {/* Monthly Outflow */}
              <SpotlightCard
                radius={280}
                spotlightColor="rgba(244, 63, 94, 0.16)"
                className="p-5"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">
                    Monthly Outflow
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-foreground mt-2.5 tracking-tight">
                  -{formatCurrency(expenses)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Expenses recorded this cycle</p>
              </SpotlightCard>

              {/* Net Savings */}
              <SpotlightCard
                radius={280}
                spotlightColor="rgba(99, 102, 241, 0.18)"
                className="p-5"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">
                    Net Savings
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {savingsRate}% retention
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-foreground mt-2.5 tracking-tight">
                  {formatCurrency(savings)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Asset accumulation rate</p>
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* Budget Warning Alert (if any) */}
        {stats?.budgets && <BudgetWarnings budgets={stats.budgets} />}

        {/* Main Analytics + Ledger Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Visual Analytics & Savings Goals (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <SpotlightCard
              radius={400}
              spotlightColor="rgba(99, 102, 241, 0.12)"
              className="p-5 sm:p-6"
            >
              <div className="pb-3 border-b border-border/50 dark:border-white/[0.05] flex flex-row items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">Financial Flow</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Visual cash movement and allocation</p>
                </div>

                {/* Aceternity Sliding Pill Tab Switcher */}
                <div className="relative flex items-center p-1 rounded-xl bg-muted/60 dark:bg-white/[0.04] border border-border/50 dark:border-white/[0.06]">
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
                  <IncomeExpenseChart data={charts?.monthlyData ?? []} />
                )}
                {activeChartTab === 'categories' && (
                  <ExpensesByCategoryChart data={charts?.expensesByCategory ?? []} />
                )}
                {activeChartTab === 'savings' && (
                  <SavingsTrendChart data={charts?.savingsTrend ?? []} />
                )}
              </div>
            </SpotlightCard>

            {/* Savings Goals & Target Milestones */}
            <SpotlightCard
              radius={350}
              spotlightColor="rgba(255, 255, 255, 0.08)"
              className="p-5 sm:p-6"
            >
              <div className="pb-3 border-b border-border/50 dark:border-white/[0.05] flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">Savings Goals</h3>
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-accent dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.06]">
                    {stats?.goals?.length ?? 0} active
                  </span>
                </div>
                <Link href="/goals" prefetch={false}>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {stats?.goals?.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No active savings goals. Create one to start tracking milestones.
                  </div>
                ) : (
                  (stats?.goals || []).slice(0, 3).map((goal) => {
                    const pct = Math.min(100, Math.round((Number(goal.savedAmount || 0) / Number(goal.targetAmount || 1)) * 100));
                    return (
                      <div key={goal.id} className="space-y-1.5 p-2 rounded-xl hover:bg-accent/40 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground truncate">{goal.name}</span>
                          <span className="font-mono tabular-nums text-muted-foreground text-[11px]">
                            {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted/60 dark:bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-white dark:to-zinc-300 transition-all duration-500 shadow-xs"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column: Passbook Ledger & Upcoming Bills (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Recent Passbook Activity */}
            <SpotlightCard
              radius={350}
              spotlightColor="rgba(255, 255, 255, 0.08)"
              className="p-5 sm:p-6"
            >
              <div className="pb-3 border-b border-border/50 dark:border-white/[0.05] flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Recent Activity</h3>
                <Link href="/transactions" prefetch={false}>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                    <span>Ledger</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-1">
                {(stats?.recentTransactions || []).length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No recent transactions recorded.
                  </div>
                ) : (
                  (stats?.recentTransactions || []).slice(0, 6).map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-accent/40 dark:hover:bg-white/[0.03] transition-colors group"
                      >
                        <div
                          className={cn(
                            'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105',
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          )}
                        >
                          {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {tx.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {tx.category?.name || 'General'} · {formatDate(tx.date)}
                          </p>
                        </div>

                        <span
                          className={cn(
                            'text-xs font-mono font-bold tabular-nums shrink-0',
                            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                          )}
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </SpotlightCard>

            {/* Upcoming Bills Widget */}
            <SpotlightCard
              radius={350}
              spotlightColor="rgba(255, 255, 255, 0.08)"
              className="p-5 sm:p-6"
            >
              <div className="pb-3 border-b border-border/50 dark:border-white/[0.05] flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Upcoming Commitments</h3>
                <Link href="/bills" prefetch={false}>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-1">
                {(stats?.upcomingBills || []).length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>No upcoming bills scheduled</span>
                  </div>
                ) : (
                  (stats?.upcomingBills || []).slice(0, 4).map((bill) => {
                    const days = getDaysUntilDue(bill.dueDate);
                    return (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl hover:bg-accent/40 dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-accent/60 dark:bg-white/[0.04] flex items-center justify-center text-muted-foreground border border-border/40 shrink-0">
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
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </SpotlightCard>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
