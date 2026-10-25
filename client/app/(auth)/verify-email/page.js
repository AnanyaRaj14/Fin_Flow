'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Logo } from '@/components/ui/logo';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="py-6 text-center space-y-4">
      {status === 'loading' && (
        <div className="space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Verifying your email token...</p>
        </div>
      )}
      {status === 'success' && (
        <div className="space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Email verified successfully!</h2>
          <p className="text-xs text-muted-foreground">Your account is fully activated. You may now sign in.</p>
          <Link href="/login" className="block pt-2">
            <Button className="w-full text-xs h-10 shadow-sm">
              Sign In <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      )}
      {status === 'error' && (
        <div className="space-y-3">
          <XCircle className="w-10 h-10 text-destructive mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Verification failed</h2>
          <p className="text-xs text-muted-foreground">The link is invalid or has expired.</p>
          <Link href="/login" className="block pt-2">
            <Button variant="outline" className="w-full text-xs h-10">
              Back to sign in
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <Link href="/dashboard" className="mb-3 inline-block">
          <Logo size="lg" />
        </Link>
        <p className="text-xs text-muted-foreground font-medium">Simple, quiet financial clarity</p>
      </div>

      <SpotlightCard className="p-0 border-border/70 dark:border-white/[0.1] dark:bg-[#121215]/85 backdrop-blur-xl shadow-2xl">
        <div className="text-center pb-2 pt-6 px-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Email Verification</h2>
        </div>

        <div className="px-6 pb-6">
          <Suspense fallback={
            <div className="py-10 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            </div>
          }>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
