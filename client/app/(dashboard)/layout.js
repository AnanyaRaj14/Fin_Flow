'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ServerCrash } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function ProtectedLayout({ children }) {
  const { user, loading, serverError } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !serverError && !user) {
      router.replace('/login');
    }
  }, [user, loading, serverError, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (serverError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6 bg-background">
        <ServerCrash className="w-12 h-12 text-muted-foreground opacity-40" />
        <h2 className="text-lg font-semibold">Cannot connect to server</h2>
        <p className="text-muted-foreground text-xs max-w-sm">
          Please make sure the backend is running on port 5001.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) return null;

  const getPageTitle = () => {
    if (pathname.startsWith('/accounts')) return 'Accounts & Wallets';
    if (pathname.startsWith('/transactions')) return 'Transactions & Ledger';
    if (pathname.startsWith('/budgets')) return 'Budgets & Limits';
    if (pathname.startsWith('/goals')) return 'Financial Goals';
    if (pathname.startsWith('/bills')) return 'Recurring Bills';
    if (pathname.startsWith('/categories')) return 'Categories';
    if (pathname.startsWith('/reports')) return 'Analytics & Reports';
    if (pathname.startsWith('/settings')) return 'Settings & Preferences';
    return 'Home';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative selection:bg-foreground/10">
      {/* Persistent Left Sidebar - Never unmounts during navigation */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Dynamic Right Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Header onMenuClick={() => setSidebarOpen(true)} title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
