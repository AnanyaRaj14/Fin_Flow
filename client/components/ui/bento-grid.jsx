'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function BentoGrid({ className, children }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  className,
  title,
  description,
  header,
  icon: Icon,
  children,
  badge,
  action,
  ...props
}) {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-300 shadow-sm hover:shadow-md hover:border-border dark:border-white/[0.08] dark:bg-card/80 dark:hover:border-white/[0.18]',
        className
      )}
      {...props}
    >
      {(title || Icon || badge || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-sm tracking-tight text-foreground">{title}</h3>}
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                {badge}
              </span>
            )}
            {action}
          </div>
        </div>
      )}

      {header}

      <div className="flex-1">{children}</div>
    </div>
  );
}
