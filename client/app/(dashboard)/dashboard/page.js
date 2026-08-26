'use client';

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, DollarSign, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import UpcomingBills from '@/components/dashboard/UpcomingBills';
import BudgetWarnings from '@/components/dashboard/BudgetWarnings';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import ExpensesByCategoryChart from '@/components/charts/ExpensesByCategoryChart';
import SavingsTrendChart from '@/components/charts/SavingsTrendChart';
import MonthlySpendingChart from '@/components/charts/MonthlySpendingChart';
import { SkeletonCard } from '@/components/ui/skeleton';
import { dashboardApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xl font-bold">
            {greeting()}, Prince Kumar
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here&apos;s your financial overview for this month.
          </p>
        </motion.div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Total Balance"
              value={formatCurrency(stats?.totalBalance ?? 0)}
              icon={Wallet}
              color="primary"
              subtitle="Across all accounts"
            />
            <StatCard
              title="Income"
              value={formatCurrency(stats?.totalIncome ?? 0)}
              icon={TrendingUp}
              color="emerald"
              trend="up"
              subtitle="This month"
            />
            <StatCard
              title="Expenses"
              value={formatCurrency(stats?.totalExpenses ?? 0)}
              icon={TrendingDown}
              color="red"
              trend="down"
              subtitle="This month"
            />
            <StatCard
              title="Savings"
              value={formatCurrency(stats?.totalSavings ?? 0)}
              icon={PiggyBank}
              color="blue"
              subtitle="Income − Expenses"
            />
            <StatCard
              title="Budget Left"
              value={formatCurrency(Math.max(0, stats?.remainingBudget ?? 0))}
              icon={DollarSign}
              color="amber"
              subtitle="This month"
            />
            <StatCard
              title="Active Goals"
              value={stats?.goals?.length ?? 0}
              icon={Target}
              color="violet"
              subtitle="In progress"
            />
          </div>
        )}

        {/* Budget warnings */}
        {stats?.budgets && <BudgetWarnings budgets={stats.budgets} />}

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <IncomeExpenseChart data={charts?.monthlyData ?? []} />
          </div>
          <ExpensesByCategoryChart data={charts?.expensesByCategory ?? []} />
        </div>

        {/* Charts row 2 + upcoming bills */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <SavingsTrendChart data={charts?.savingsTrend ?? []} />
          </div>
          <UpcomingBills bills={stats?.upcomingBills ?? []} />
        </div>

        {/* Monthly spending + recent transactions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <MonthlySpendingChart data={charts?.dailySpending ?? []} />
          </div>
          <div>
            <RecentTransactions transactions={stats?.recentTransactions ?? []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
