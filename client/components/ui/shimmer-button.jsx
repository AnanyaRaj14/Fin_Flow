'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function ShimmerButton({
  children,
  className,
  onClick,
  disabled = false,
  type = 'button',
  borderRadius,
  shimmerColor,
  shimmerSize,
  shimmerDuration,
  background,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base geometry & layout
        'group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap px-4 py-2 text-xs font-semibold select-none cursor-pointer',
        'transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
        'rounded-xl tracking-tight shadow-xs',
        // High-contrast, sleek Vercel/Linear/Stripe styling
        // Light mode: deep crisp charcoal/black with top rim light
        'bg-[#121215] text-white hover:bg-[#1f1f24]',
        'border border-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.15)]',
        // Dark mode: pure crisp contrast white button with subtle shadow
        'dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:border-white/20',
        'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.6)]',
        className
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
        {children}
      </span>
    </button>
  );
}
