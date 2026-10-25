'use client';

import React, { useRef } from 'react';
import { useMotionValue, motion, useMotionTemplate } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SpotlightCard({
  children,
  className,
  radius = 350,
  spotlightColor = 'rgba(99, 102, 241, 0.1)',
  ...props
}) {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  function handleMouseLeave() {
    mouseX.set(-1000);
    mouseY.set(-1000);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 overflow-hidden',
        // Light mode: frosted glass with soft ambient shadow and crisp border
        'bg-white/90 border border-zinc-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_12px_24px_-4px_rgba(0,0,0,0.03)]',
        'hover:border-zinc-300 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08),0_16px_32px_-4px_rgba(0,0,0,0.05)]',
        // Dark mode: obsidian glass elevation with top rim light
        'dark:border-white/[0.08] dark:bg-[#121215]/85 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        'dark:hover:border-white/[0.18]',
        className
      )}
      {...props}
    >
      {/* Dynamic Aceternity Mouse Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
