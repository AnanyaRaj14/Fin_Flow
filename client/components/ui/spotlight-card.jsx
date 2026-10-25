'use client';

import React, { useRef } from 'react';
import { useMotionValue, motion, useMotionTemplate } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SpotlightCard({
  children,
  className,
  radius = 350,
  spotlightColor = 'rgba(255, 255, 255, 0.08)',
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
        'group relative rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300',
        'dark:border-white/[0.08] dark:bg-[#121215]/80 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        'hover:border-border dark:hover:border-white/[0.16] overflow-hidden',
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
