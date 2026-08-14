'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <Card className="shadow-xl border-0">
      <CardContent className="py-10 text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-semibold">Email verified!</h2>
            <p className="text-muted-foreground">Your account is now active.</p>
            <Link href="/login"><Button className="w-full">Go to login</Button></Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Verification failed</h2>
            <p className="text-muted-foreground">The link is invalid or has expired.</p>
            <Link href="/login"><Button variant="outline" className="w-full">Back to login</Button></Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold">FinFlow</span>
      </div>
      <Suspense fallback={
        <Card className="shadow-xl border-0">
          <CardContent className="py-10 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </motion.div>
  );
}
