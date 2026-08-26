'use client';

import Link from 'next/link';
import { AlertCircle, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, getDaysUntilDue } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function UpcomingBills({ bills = [] }) {
  return (
    <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-border/40 dark:border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Upcoming Commitments</CardTitle>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {bills.length} pending
            </span>
          </div>
          <Link href="/bills">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-7 gap-1">
              <span>All bills</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-2 space-y-1">
        {bills.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-0.5">No bills due in the upcoming cycle.</p>
          </div>
        ) : (
          bills.map((bill) => {
            const daysLeft = getDaysUntilDue(bill.dueDate);
            const isCritical = daysLeft <= 1;
            const isUrgent = daysLeft <= 3;

            return (
              <div
                key={bill.id}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 dark:hover:bg-white/[0.03] transition-colors"
              >
                {/* Icon indicator */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105',
                    isCritical
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      : isUrgent
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-primary/10 text-primary border-primary/20'
                  )}
                >
                  <Calendar className="w-4 h-4" />
                </div>

                {/* Bill info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{bill.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span>
                      {daysLeft === 0
                        ? 'Due today'
                        : daysLeft === 1
                        ? 'Due tomorrow'
                        : `Due in ${daysLeft} days`}
                    </span>
                    {bill.category?.name && (
                      <>
                        <span>•</span>
                        <span className="truncate">{bill.category.name}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Amount and status pill */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-mono tabular-nums block text-foreground">
                    {formatCurrency(bill.amount)}
                  </span>
                  {isUrgent && (
                    <span
                      className={cn(
                        'inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded-md border mt-0.5',
                        isCritical
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      )}
                    >
                      {isCritical ? 'Action required' : 'Due soon'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
