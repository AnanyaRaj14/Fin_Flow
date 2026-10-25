'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the browser loaded /index.html as a fallback for another route (e.g. /login/ or /budgets/):
    if (typeof window !== 'undefined') {
      const cleanPath = window.location.pathname.replace(/\/$/, '') || '/';
      if (cleanPath !== '/' && cleanPath !== window.location.pathname) {
        router.replace(cleanPath);
        return;
      }
    }

    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}
