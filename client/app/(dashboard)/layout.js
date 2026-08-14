'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ServerCrash } from 'lucide-react';

export default function ProtectedLayout({ children }) {
  const { user, loading, serverError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is done, no server error, and genuinely not logged in
    if (!loading && !serverError && !user) {
      router.replace('/login');
    }
  }, [user, loading, serverError, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Server is down — show a friendly message instead of redirect loop
  if (serverError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
        <ServerCrash className="w-14 h-14 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-semibold">Cannot connect to server</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          The backend server is not running. Start it with{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">npm run dev</code>{' '}
          inside the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">server/</code> folder,
          then refresh this page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
