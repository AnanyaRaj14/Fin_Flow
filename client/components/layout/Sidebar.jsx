'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PiggyBank, Target,
  Receipt, BarChart3, Settings, LogOut, X, TrendingUp, Tag,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Accounts',     href: '/accounts',      icon: Wallet },
  { label: 'Transactions', href: '/transactions',  icon: ArrowLeftRight },
  { label: 'Budgets',      href: '/budgets',       icon: PiggyBank },
  { label: 'Goals',        href: '/goals',         icon: Target },
  { label: 'Bills',        href: '/bills',         icon: Receipt },
  { label: 'Categories',   href: '/categories',    icon: Tag },
  { label: 'Reports',      href: '/reports',       icon: BarChart3 },
  { label: 'Settings',     href: '/settings',      icon: Settings },
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
    <aside className="h-full w-64 bg-card border-r flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">FinFlow</span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-accent">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs">{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: static */}
      <div className="hidden lg:block h-full">{sidebarContent}</div>

      {/* Mobile: overlay drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
          <div className="fixed left-0 top-0 z-50 h-full lg:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
