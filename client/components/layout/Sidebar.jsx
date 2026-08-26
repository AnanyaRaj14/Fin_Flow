'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PiggyBank, Target,
  Receipt, BarChart3, Settings, LogOut, X, Tag
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { toast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

const navSections = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Accounts', href: '/accounts', icon: Wallet },
      { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    ],
  },
  {
    title: 'PLANNING',
    items: [
      { label: 'Budgets', href: '/budgets', icon: PiggyBank },
      { label: 'Goals', href: '/goals', icon: Target },
      { label: 'Bills', href: '/bills', icon: Receipt },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { label: 'Categories', href: '/categories', icon: Tag },
      { label: 'Reports', href: '/reports', icon: BarChart3 },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    router.push('/login');
  };

  const sidebarContent = (
    <aside className="h-full w-60 bg-card/95 border-r border-border/60 dark:border-white/[0.06] dark:bg-[#151515] flex flex-col justify-between select-none">
      {/* Header & Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 dark:border-white/[0.04]">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <p className="px-2.5 text-[10px] font-bold tracking-wider text-muted-foreground/60">
                {section.title}
              </p>
              <div className="space-y-0.5 pt-0.5">
                {section.items.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 relative group',
                        active
                          ? 'bg-accent text-foreground font-semibold dark:bg-white/[0.08] dark:text-white shadow-xs'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground dark:hover:bg-white/[0.03]'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-3.5 h-3.5 shrink-0 transition-colors',
                          active ? 'text-foreground dark:text-white' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      <span className="flex-1 truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-border/40 dark:border-white/[0.04]">
        <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-accent/30 dark:bg-white/[0.02] border border-border/40 dark:border-white/[0.04]">
          <Avatar className="w-7 h-7 border border-border/60 dark:border-white/10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-foreground">{user?.name || 'FinFlow User'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
            className="w-6 h-6 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block h-full shrink-0">{sidebarContent}</div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden" onClick={onClose} />
          <div className="fixed left-0 top-0 z-50 h-full lg:hidden animate-in slide-in-from-left duration-150">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
