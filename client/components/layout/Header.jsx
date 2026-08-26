'use client';

import Link from 'next/link';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import NotificationsPanel from './NotificationsPanel';
import QuickAddPopover from '@/components/dashboard/QuickAddPopover';
import { cn } from '@/lib/utils';

export default function Header({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/60 bg-background/85 backdrop-blur-md px-4 lg:px-8 dark:border-white/[0.06] dark:bg-[#191919]/90 transition-colors select-none">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden shrink-0 w-8 h-8 rounded-lg" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold text-sm tracking-tight text-foreground">{title}</h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Fancy Quick Add Entry Popover */}
        <QuickAddPopover />

        {/* Super Minimal Segmented Theme Toggle Pill */}
        <div className="flex items-center p-0.5 rounded-full bg-accent/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => theme !== 'light' && toggleTheme()}
            title="Light mode"
            className={cn(
              'p-1.5 rounded-full transition-all duration-200',
              theme === 'light'
                ? 'bg-background shadow-xs text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => theme !== 'dark' && toggleTheme()}
            title="Dark mode"
            className={cn(
              'p-1.5 rounded-full transition-all duration-200',
              theme === 'dark'
                ? 'bg-background shadow-xs text-foreground dark:bg-white/10'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notification Center */}
        <NotificationsPanel />
      </div>
    </header>
  );
}
