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
    fetchNotifications();
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
          <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-background border rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <Badge variant="destructive" className="text-xs">{notifications.length}</Badge>
              )}
              <button onClick={() => setOpen(false)} className="ml-auto p-1 rounded hover:bg-accent">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>All caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-accent/30 transition-colors',
                      n.urgent && 'bg-red-50/50 dark:bg-red-950/20'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colorMap[n.type])}>
                      {iconMap[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                    </div>
                    {n.urgent && <div className="w-2 h-2 bg-red-500 rounded-full mt-1 shrink-0" />}
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
