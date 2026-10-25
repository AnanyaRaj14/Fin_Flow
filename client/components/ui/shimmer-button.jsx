'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function ShimmerButton({
  children,
  className,
  shimmerColor = '#ffffff',
  shimmerSize = '0.05em',
  shimmerDuration = '3s',
  borderRadius = '12px',
  background = 'rgba(0, 0, 0, 1)',
  onClick,
  ...props
}) {
  return (
    <button
      onClick={onClick}
      style={{
        '--spread': '90deg',
        '--shimmer-color': shimmerColor,
        '--radius': borderRadius,
        '--speed': shimmerDuration,
        '--cut': shimmerSize,
        '--bg': background,
      }}
      className={cn(
        'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-4 py-2 text-xs font-medium text-white transition-all duration-300 [background:var(--bg)] [border-radius:var(--radius)] hover:scale-[1.01] active:scale-[0.98]',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] border border-white/10 dark:border-white/15',
        className
      )}
      {...props}
    >
      {/* Spark container */}
      <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]">
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>
      {children}
    </button>
  );
}
