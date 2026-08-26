'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function SpotlightCard({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-card/90 dark:border-white/[0.06] dark:bg-[#111622]/70 dark:hover:border-white/[0.14] dark:hover:bg-[#141B2A]',
        className
      )}
      {...props}
    >
      {/* Lightweight GPU-accelerated subtle ambient highlight on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
