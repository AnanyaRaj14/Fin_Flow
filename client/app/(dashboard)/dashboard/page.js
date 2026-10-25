'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Target,
  Plus, ArrowUpRight, ArrowDownLeft, Calendar,
  Receipt, CheckCircle2, ChevronRight, BarChart3, PieChart as PieIcon,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import ExpensesByCategoryChart from '@/components/charts/ExpensesByCategoryChart';
import SavingsTrendChart from '@/components/charts/SavingsTrendChart';
import BudgetWarnings from '@/components/dashboard/BudgetWarnings';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

        {/* Minimal Hero: Net Worth & Action Bar */}
        <div className="rounded-2xl p-6 sm:p-7 border border-border/70 dark:border-white/[0.06] bg-card/60 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-medium tracking-wide uppercase text-[10px]">Portfolio Overview</span>
                <span>·</span>
                <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>

              <p className="text-xs font-medium text-muted-foreground">
                {greeting()}, {displayName}
              </p>
              
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-semibold tracking-tight font-mono tabular-nums text-foreground">
                  {formatCurrency(stats?.totalBalance ?? 0)}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  net worth
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link href="/transactions">
                <Button size="sm" className="h-8 px-3.5 rounded-lg text-xs font-medium gap-1.5 shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Transaction</span>
                </Button>
              </Link>
              <Link href="/accounts">
                <Button variant="outline" size="sm" className="h-8 px-3.5 rounded-lg text-xs font-medium">
                  <Wallet className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <span>Accounts</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Key Metrics Strip (Clean & Understated) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Inflow Card */}
            <div className="rounded-xl border border-border/70 dark:border-white/[0.06] bg-card/40 p-4 transition-colors hover:border-border">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium tracking-wider uppercase">
                  Monthly Inflow
                </span>
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-foreground mt-2">
                {formatCurrency(income)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Cash received this cycle</p>
            </div>

            {/* Outflow Card */}
            <div className="rounded-xl border border-border/70 dark:border-white/[0.06] bg-card/40 p-4 transition-colors hover:border-border">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium tracking-wider uppercase">
                  Monthly Outflow
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-foreground mt-2">
                {formatCurrency(expenses)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Expenses recorded this cycle</p>
            </div>

            {/* Net Savings Card */}
            <div className="rounded-xl border border-border/70 dark:border-white/[0.06] bg-card/40 p-4 transition-colors hover:border-border">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium tracking-wider uppercase">
                  Net Savings
                </span>
                <span className="text-[11px] font-mono font-medium text-emerald-500">
                  {savingsRate}% retention
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-foreground mt-2">
                {formatCurrency(savings)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Asset accumulation rate</p>
            </div>
          </div>
        )}

        {/* Budget Warning Alert (if any) */}
        {stats?.budgets && <BudgetWarnings budgets={stats.budgets} />}

        {/* Main Analytics + Ledger Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Visual Analytics & Savings Goals (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-border/70 dark:border-white/[0.06] dark:bg-card/75 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/40 dark:border-white/[0.04] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold tracking-tight text-foreground">Financial Flow</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Visual allocation and cash movement</p>
                </div>

                {/* Minimal Segmented Tab Switcher */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-accent/60 dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.05]">
                  <button
                    onClick={() => setActiveChartTab('cashflow')}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
                      activeChartTab === 'cashflow'
                        ? 'bg-background shadow-xs text-foreground font-semibold dark:bg-white/10'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Cash Flow
                  </button>
                  <button
                    onClick={() => setActiveChartTab('categories')}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
                      activeChartTab === 'categories'
                        ? 'bg-background shadow-xs text-foreground font-semibold dark:bg-white/10'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => setActiveChartTab('savings')}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
                      activeChartTab === 'savings'
                        ? 'bg-background shadow-xs text-foreground font-semibold dark:bg-white/10'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Trajectory
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                {activeChartTab === 'cashflow' && (
                  <IncomeExpenseChart data={charts?.monthlyData ?? []} />
                )}
                {activeChartTab === 'categories' && (
                  <ExpensesByCategoryChart data={charts?.expensesByCategory ?? []} />
                )}
                {activeChartTab === 'savings' && (
                  <SavingsTrendChart data={charts?.savingsTrend ?? []} />
                )}
              </CardContent>
            </Card>

            {/* Savings Goals & Target Milestones */}
            <Card className="border border-border/70 dark:border-white/[0.06] dark:bg-card/75 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/40 dark:border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold tracking-tight">Savings Goals</CardTitle>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {stats?.goals?.length ?? 0} active
                    </span>
                  </div>
                  <Link href="/goals">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                      <span>View all</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {stats?.goals?.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No active savings goals. Create one to start tracking milestones.
                  </div>
                ) : (
                  (stats?.goals || []).slice(0, 3).map((goal) => {
                    const pct = Math.min(100, Math.round((Number(goal.savedAmount || 0) / Number(goal.targetAmount || 1)) * 100));
                    return (
                      <div key={goal.id} className="space-y-1.5 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground truncate">{goal.name}</span>
                          <span className="font-mono tabular-nums text-muted-foreground">
                            {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted/60 dark:bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-foreground dark:bg-white transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Passbook Ledger & Upcoming Bills (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Recent Passbook Activity */}
            <Card className="border border-border/70 dark:border-white/[0.06] dark:bg-card/75 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/40 dark:border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold tracking-tight">Recent Activity</CardTitle>
                  <Link href="/transactions">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                      <span>Ledger</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-0.5">
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
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/40 dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border',
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          )}
                        >
                          {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{tx.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {tx.category?.name || 'General'} · {formatDate(tx.date)}
                          </p>
                        </div>

                        <span
                          className={cn(
                            'text-xs font-mono font-medium tabular-nums shrink-0',
                            isIncome ? 'text-emerald-500' : 'text-foreground'
                          )}
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Upcoming Bills Widget */}
            <Card className="border border-border/70 dark:border-white/[0.06] dark:bg-card/75 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/40 dark:border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold tracking-tight">Upcoming Commitments</CardTitle>
                  <Link href="/bills">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1 hover:text-foreground">
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-0.5">
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
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-accent/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{bill.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {days === 0 ? 'Due today' : `In ${days} days`}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-medium tabular-nums text-foreground shrink-0">
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
