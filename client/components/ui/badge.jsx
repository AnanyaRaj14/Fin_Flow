import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold font-mono tracking-tight transition-colors focus:outline-none select-none',
  {
    variants: {
      variant: {
        default: 'border-border/60 bg-muted/60 text-foreground',
        secondary: 'border-border/40 bg-accent/40 text-muted-foreground',
        destructive: 'border-rose-500/20 bg-rose-500/10 text-rose-500',
        outline: 'border-border/80 text-foreground',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        income: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        expense: 'border-rose-500/20 bg-rose-500/10 text-rose-500 dark:text-rose-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

const Badge = ({ className, variant, ...props }) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge, badgeVariants };
