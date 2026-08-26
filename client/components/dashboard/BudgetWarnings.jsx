'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function BudgetWarnings({ budgets = [] }) {
  const exceeded = budgets.filter((b) => Number(b.spent || 0) > Number(b.amount || 0));
  if (exceeded.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] backdrop-blur-md p-4 transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-300 uppercase tracking-wider">
              Budget Threshold Exceeded
            </p>
            <p className="text-xs text-muted-foreground">
              {exceeded.length} categor{exceeded.length > 1 ? 'ies have' : 'y has'} crossed monthly limit
            </p>
          </div>
        </div>
        <Link
          href="/budgets"
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Adjust</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {exceeded.map((b) => (
          <Link key={b.id} href="/budgets">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors">
              <span
                className="w-2 h-2 rounded-full ring-2 ring-amber-500/20"
                style={{ background: b.category?.color || '#f59e0b' }}
              />
              <span className="truncate max-w-[120px]">{b.category?.name || 'Category'}</span>
              <span className="font-mono tabular-nums text-rose-500">
                +{formatCurrency(Number(b.spent) - Number(b.amount))}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
