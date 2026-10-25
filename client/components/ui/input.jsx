import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9.5 w-full rounded-xl border border-border/80 dark:border-white/10 bg-background/80 dark:bg-white/[0.03] px-3.5 py-1.5 text-xs text-foreground shadow-xs transition-all duration-150 placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-foreground/40 dark:focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-foreground/10 dark:focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
