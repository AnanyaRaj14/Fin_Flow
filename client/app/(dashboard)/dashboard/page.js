'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet, Plus, ChevronRight, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import ExpensesByCategoryChart from '@/components/charts/ExpensesByCategoryChart';
import SavingsTrendChart from '@/components/charts/SavingsTrendChart';
import BudgetWarnings from '@/components/dashboard/BudgetWarnings';
import { Button } from '@/components/ui/button';
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

        {/* Minimalist Unified Overview */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 dark:border-white/[0.06] bg-card dark:bg-[#121215]/80 p-6 sm:p-7 backdrop-blur-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-border/40 dark:border-white/[0.05]">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {greeting()}, {displayName}
                </p>
                <div className="mt-1 flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-semibold tracking-tight font-mono tabular-nums text-foreground">
                    {formatCurrency(stats?.totalBalance ?? 0)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    net worth
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Link href="/transactions" prefetch={false}>
                  <Button size="sm" className="h-8 px-3.5 rounded-lg text-xs font-medium gap-1.5 shadow-none">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Transaction</span>
                  </Button>
                </Link>
                <Link href="/accounts" prefetch={false}>
                  <Button variant="outline" size="sm" className="h-8 px-3.5 rounded-lg text-xs font-medium dark:bg-white/[0.02]">
                    <Wallet className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <span>Accounts</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* 3 Inline Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Monthly Inflow</span>
                <p className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-emerald-500 dark:text-emerald-400 mt-1">
                  +{formatCurrency(income)}
                </p>
              </div>

              <div className="sm:border-l sm:border-border/40 sm:dark:border-white/[0.05] sm:pl-6">
                <span className="text-xs text-muted-foreground font-medium">Monthly Outflow</span>
                <p className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-foreground mt-1">
                  -{formatCurrency(expenses)}
                </p>
              </div>

              <div className="sm:border-l sm:border-border/40 sm:dark:border-white/[0.05] sm:pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Net Savings</span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {savingsRate}% saved
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-foreground mt-1">
                  {formatCurrency(savings)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Budget Warning Alert (if any) */}
        {stats?.budgets && <BudgetWarnings budgets={stats.budgets} />}

        {/* Main Analytics + Ledger Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Visual Analytics & Savings Goals (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-border/60 dark:border-white/[0.06] bg-card dark:bg-[#121215]/80 p-5 sm:p-6 backdrop-blur-xs">
              <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] flex flex-row items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">Financial Flow</h3>
                </div>

                {/* Minimalist Tab Switcher */}
                <div className="relative flex items-center p-0.5 rounded-lg bg-muted/40 dark:bg-white/[0.03] border border-border/40 dark:border-white/[0.06]">
                  {[
                    { id: 'cashflow', label: 'Cash Flow' },
                    { id: 'categories', label: 'Categories' },
                    { id: 'savings', label: 'Trajectory' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveChartTab(tab.id)}
                      className={cn(
                        'relative px-2.5 py-1 text-xs font-medium transition-colors z-10',
                        activeChartTab === tab.id
                          ? 'text-foreground font-semibold dark:text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {activeChartTab === tab.id && (
                        <motion.div
                          layoutId="chartActivePill"
                          className="absolute inset-0 rounded-md bg-background shadow-xs dark:bg-white/10 border border-border/60 dark:border-white/10"
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
            </div>

            {/* Savings Goals & Target Milestones */}
            <div className="rounded-2xl border border-border/60 dark:border-white/[0.06] bg-card dark:bg-[#121215]/80 p-5 sm:p-6 backdrop-blur-xs">
              <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] flex items-center justify-between mb-4">
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
                      <div key={goal.id} className="space-y-1.5 p-2 rounded-lg hover:bg-accent/30 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground truncate">{goal.name}</span>
                          <span className="font-mono tabular-nums text-muted-foreground text-[11px]">
                            {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-muted/60 dark:bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-foreground dark:bg-white transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Passbook Ledger & Upcoming Bills (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Recent Passbook Activity */}
            <div className="rounded-2xl border border-border/60 dark:border-white/[0.06] bg-card dark:bg-[#121215]/80 p-5 sm:p-6 backdrop-blur-xs">
              <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Recent Activity</h3>
                <Link href="/transactions" prefetch={false}>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                    <span>Ledger</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-border/30 dark:divide-white/[0.04]">
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
                        className="flex items-center justify-between py-2.5 px-1 hover:bg-accent/30 dark:hover:bg-white/[0.02] rounded-lg transition-colors group"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-foreground">
                            {tx.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {tx.category?.name || 'General'} · {formatDate(tx.date)}
                          </p>
                        </div>

                        <span
                          className={cn(
                            'text-xs font-mono font-medium tabular-nums shrink-0',
                            isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-foreground'
                          )}
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Upcoming Bills Widget */}
            <div className="rounded-2xl border border-border/60 dark:border-white/[0.06] bg-card dark:bg-[#121215]/80 p-5 sm:p-6 backdrop-blur-xs">
              <div className="pb-3 border-b border-border/40 dark:border-white/[0.05] flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Upcoming Commitments</h3>
                <Link href="/bills" prefetch={false}>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-border/30 dark:divide-white/[0.04]">
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
                        className="flex items-center justify-between py-2.5 px-1 hover:bg-accent/30 dark:hover:bg-white/[0.02] rounded-lg transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-medium text-foreground truncate">{bill.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {days === 0 ? 'Due today' : `In ${days} days`}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-medium tabular-nums text-foreground shrink-0">
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
