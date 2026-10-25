'use client';

import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Target, Receipt, TrendingDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dashboardApi } from '@/services/api';
import { formatCurrency, getDaysUntilDue } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = () => {
    dashboardApi.getStats().then(({ data }) => {
      const items = [];

      // Upcoming bills
      data.upcomingBills?.forEach((bill) => {
        const days = getDaysUntilDue(bill.dueDate);
        if (days <= 7) {
          items.push({
            id: `bill-${bill.id}`,
            type: 'bill',
            title: `${bill.name} due in ${days} day${days !== 1 ? 's' : ''}`,
            description: formatCurrency(bill.amount),
            urgent: days <= 3,
          });
        }
      });

      // Exceeded budgets
      data.budgets?.forEach((budget) => {
        if (budget.spent > budget.amount) {
          items.push({
            id: `budget-${budget.id}`,
            type: 'budget',
            title: `${budget.category?.name || 'Category'} budget exceeded`,
            description: `${formatCurrency(budget.spent - budget.amount)} over limit`,
            urgent: true,
          });
        }
      });

      // Completed goals
      data.goals?.forEach((goal) => {
        if (goal.isCompleted || (goal.targetAmount > 0 && goal.savedAmount >= goal.targetAmount)) {
          items.push({
            id: `goal-${goal.id}`,
            type: 'goal',
            title: `Goal "${goal.name}" completed! 🎯`,
            description: `Saved ${formatCurrency(goal.savedAmount)} of ${formatCurrency(goal.targetAmount)}`,
            urgent: false,
          });
        }
      });

      // Low balance warning (< 100 in total balance)
      if (data.totalBalance !== undefined && data.totalBalance < 100 && data.totalBalance >= 0) {
        items.push({
          id: 'low-balance',
          type: 'balance',
          title: 'Low total balance',
          description: `Current balance: ${formatCurrency(data.totalBalance)}`,
          urgent: true,
        });
      }

      setNotifications(items);
    }).catch(() => {});
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const iconMap = {
    bill:    <Receipt className="w-4 h-4" />,
    budget:  <AlertTriangle className="w-4 h-4" />,
    goal:    <Target className="w-4 h-4" />,
    balance: <TrendingDown className="w-4 h-4" />,
  };

  const colorMap = {
    bill:    'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    budget:  'text-red-600 bg-red-100 dark:bg-red-900/30',
    goal:    'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    balance: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative">
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && open === false && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-84 max-w-[22rem] z-50 bg-card/95 backdrop-blur-xl border border-border/80 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-xs tracking-tight text-foreground">Notifications</h3>
                {notifications.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500 border border-rose-500/20">
                    {notifications.length}
                  </span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/30 dark:divide-white/[0.04]">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="font-medium text-foreground">All caught up!</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">No overdue bills or budget limits exceeded.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 hover:bg-accent/30 dark:hover:bg-white/[0.02] transition-colors',
                      n.urgent && 'bg-rose-500/[0.03] dark:bg-rose-950/10'
                    )}
                  >
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/5', colorMap[n.type])}>
                      {iconMap[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-tight">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{n.description}</p>
                    </div>
                    {n.urgent && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0 animate-pulse" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
