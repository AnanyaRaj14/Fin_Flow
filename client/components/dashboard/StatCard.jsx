'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  const colorMap = {
    primary:     { bg: 'bg-primary/10',  text: 'text-primary' },
    emerald:     { bg: 'bg-emerald-100 dark:bg-emerald-900/30',  text: 'text-emerald-600 dark:text-emerald-400' },
    red:         { bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-600 dark:text-red-400' },
    amber:       { bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-600 dark:text-amber-400' },
    blue:        { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600 dark:text-blue-400' },
    violet:      { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
  };

  const { bg, text } = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn('text-2xl font-bold mt-1 truncate', trend === 'up' && 'text-emerald-600 dark:text-emerald-400', trend === 'down' && 'text-red-600 dark:text-red-400')}>
              {value}
            </p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={cn('p-2.5 rounded-xl flex-shrink-0', bg)}>
              <Icon className={cn('w-5 h-5', text)} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
