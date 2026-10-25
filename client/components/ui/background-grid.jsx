'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function GridBackground({
  children,
  className,
  pattern = 'grid',
}) {
  return (
    <div className={cn('relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden', className)}>
      {/* Aceternity Grid Pattern with Radial Gradient Mask */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none',
          pattern === 'grid'
            ? 'bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]'
            : 'bg-[radial-gradient(rgba(0,0,0,0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:20px_20px]'
        )}
        style={{
          maskImage: 'radial-gradient(ellipse 75% 75% at center, #000 55%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at center, #000 55%, transparent 100%)',
        }}
      />
      <div className="relative z-10 w-full flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
