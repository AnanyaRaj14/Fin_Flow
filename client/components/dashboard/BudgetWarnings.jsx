'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function BudgetWarnings({ budgets = [] }) {
  const exceeded = budgets.filter((b) => b.spent > b.amount);
  if (exceeded.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          {exceeded.length} budget{exceeded.length > 1 ? 's' : ''} exceeded this month
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {exceeded.map((b) => (
          <Link key={b.id} href="/budgets">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-200 transition-colors">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: b.category?.color }}
              />
              {b.category?.name}: {formatCurrency(b.spent - b.amount)} over
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
