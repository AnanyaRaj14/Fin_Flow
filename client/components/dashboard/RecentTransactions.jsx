'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, Receipt, Plus, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function RecentTransactions({ transactions = [] }) {
  return (
    <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-border/40 dark:border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Recent Activity</CardTitle>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {transactions.length} items
            </span>
          </div>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-7 gap-1">
              <span>View ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-2 space-y-0.5">
        {transactions.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 border border-primary/20">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-foreground">No recent transactions</p>
            <p className="text-xs text-muted-foreground mt-0.5">Record income or expenses to see insights.</p>
            <Link href="/transactions" className="inline-block mt-3">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 rounded-xl">
                <Plus className="w-3.5 h-3.5" />
                Add transaction
              </Button>
            </Link>
          </div>
        ) : (
          transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 dark:hover:bg-white/[0.03] transition-colors"
              >
                {/* Arrow Icon */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105',
                    isIncome
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  )}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                {/* Title and metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground truncate">{tx.title}</p>
                    {tx.receiptUrl && (
                      <span title="Receipt attached" className="text-primary/70 shrink-0">
                        <Receipt className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                    <span className="truncate">{tx.category?.name || 'General'}</span>
                    <span>•</span>
                    <span className="shrink-0">{formatDate(tx.date)}</span>
                    {tx.account?.name && (
                      <>
                        <span>•</span>
                        <span className="truncate text-muted-foreground/80">{tx.account.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <span
                    className={cn(
                      'text-xs font-bold font-mono tabular-nums tracking-tight',
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-foreground'
                    )}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
