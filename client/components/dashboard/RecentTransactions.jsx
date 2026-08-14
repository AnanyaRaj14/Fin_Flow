'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function RecentTransactions({ transactions = [] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No transactions yet. Add your first one!
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
              )}>
                {tx.type === 'income'
                  ? <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  : <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.title}</p>
                <p className="text-xs text-muted-foreground">{tx.category?.name} · {formatDate(tx.date)}</p>
              </div>
              <span className={cn(
                'text-sm font-semibold shrink-0',
                tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              )}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
