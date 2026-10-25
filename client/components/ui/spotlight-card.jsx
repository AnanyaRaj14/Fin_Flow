'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function SpotlightCard({
  children,
  className,
  radius,
  spotlightColor,
  ...props
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-6 backdrop-blur-xl transition-all duration-200 overflow-hidden',
        // Light mode: clean crisp card with subtle border and elevation
        'bg-white/95 border border-zinc-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_12px_24px_-4px_rgba(0,0,0,0.03)]',
        // Dark mode: obsidian glass elevation with top rim light, no hover background shift
        'dark:border-white/[0.08] dark:bg-[#121215] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
