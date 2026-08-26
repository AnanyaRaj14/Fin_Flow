'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({
  size = 'md',
  showText = true,
  className,
}) {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-sm' },
    md: { box: 'w-8 h-8', text: 'text-base' },
    lg: { box: 'w-11 h-11', text: 'text-xl' },
    xl: { box: 'w-14 h-14', text: 'text-2xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn('inline-flex items-center gap-2.5 group select-none', className)}>
      {/* Brand Icon Mark */}
      <div
        className={cn(
          'relative rounded-xl overflow-hidden border border-border/80 dark:border-white/10 shadow-xs transition-transform duration-200 group-hover:scale-105 bg-[#121212]',
          currentSize.box
        )}
      >
        <Image
          src="/logo.png"
          alt="FinFlow"
          width={64}
          height={64}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Clean Modern Wordmark */}
      {showText && (
        <span className={cn('font-bold tracking-tight text-foreground', currentSize.text)}>
          FinFlow
        </span>
      )}
    </div>
  );
}
