import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none tracking-tight',
  {
    variants: {
      variant: {
        default:
          'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.15)] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 dark:border-white/20 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.6)]',
        destructive:
          'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 shadow-xs',
        outline:
          'border border-border/80 bg-background/50 backdrop-blur-sm shadow-xs hover:bg-accent hover:text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.08]',
        secondary:
          'bg-muted/80 text-foreground hover:bg-muted dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-border/50 dark:border-white/5',
        ghost:
          'hover:bg-accent/80 hover:text-foreground dark:hover:bg-white/[0.06]',
        link: 'text-primary underline-offset-4 hover:underline',
        glow: 'relative bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95',
      },
      size: {
        default: 'h-9 px-4 py-2 text-xs',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-10 rounded-xl px-5 text-sm',
        icon: 'h-8 w-8 rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
