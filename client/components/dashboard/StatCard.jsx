'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  trendValue,
  sparkline = true,
}) {
  const colorMap = {
    primary: {
      gradient: 'from-indigo-500/20 to-purple-500/20 text-indigo-500 dark:text-indigo-400 border-indigo-500/30',
      spotlight: 'rgba(99, 102, 241, 0.15)',
      border: 'rgba(99, 102, 241, 0.3)',
    },
    emerald: {
      gradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-500 dark:text-emerald-400 border-emerald-500/30',
      spotlight: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    rose: {
      gradient: 'from-rose-500/20 to-pink-500/20 text-rose-500 dark:text-rose-400 border-rose-500/30',
      spotlight: 'rgba(244, 63, 94, 0.15)',
      border: 'rgba(244, 63, 94, 0.3)',
    },
    amber: {
      gradient: 'from-amber-500/20 to-orange-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30',
      spotlight: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    blue: {
      gradient: 'from-blue-500/20 to-cyan-500/20 text-blue-500 dark:text-blue-400 border-blue-500/30',
      spotlight: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.3)',
    },
    violet: {
      gradient: 'from-violet-500/20 to-fuchsia-500/20 text-violet-500 dark:text-violet-400 border-violet-500/30',
      spotlight: 'rgba(139, 92, 246, 0.15)',
      border: 'rgba(139, 92, 246, 0.3)',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full"
    >
      <SpotlightCard
        spotlightColor={scheme.spotlight}
        borderColor={scheme.border}
        className="h-full flex flex-col justify-between p-5 backdrop-blur-md"
      >
        {/* Top row: Title and Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {title}
          </span>
          {Icon && (
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br border shadow-xs transition-transform duration-200 group-hover:scale-110',
                scheme.gradient
              )}
            >
              <Icon className="w-4.5 h-4.5" />
            </div>
          )}
        </div>

        {/* Middle row: Big Value */}
        <div className="mt-3">
          <div className="text-2xl lg:text-[26px] font-bold tracking-tight text-foreground font-mono tabular-nums">
            {value}
          </div>

          {/* Bottom row: Subtitle & Trend */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40 dark:border-white/[0.04]">
            <p className="text-xs text-muted-foreground truncate">{subtitle || 'Updated live'}</p>
            {trendValue && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                  trend === 'up'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                )}
              >
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trendValue}
              </span>
            )}
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
