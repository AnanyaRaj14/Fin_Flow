'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getDaysUntilDue } from '@/lib/utils';

export default function UpcomingBills({ bills = [] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Upcoming Bills</CardTitle>
          <Link href="/bills">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View all</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {bills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No upcoming bills.</div>
        ) : (
          bills.map((bill) => {
            const daysLeft = getDaysUntilDue(bill.dueDate);
            const urgent = daysLeft <= 3;
            return (
              <div key={bill.id} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <AlertCircle className={`w-4 h-4 ${urgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold">{formatCurrency(bill.amount)}</span>
                  {urgent && <Badge variant="expense" className="text-xs">Due soon</Badge>}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
