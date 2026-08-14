'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, TrendingUp, Loader2, MailCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setUnverifiedEmail('');
    try {
      await login(data);
      router.push('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach the server. Make sure it is running on port 5000.');
      } else if (err.response?.status === 403) {
        // Email not verified — show resend option
        setUnverifiedEmail(data.email);
        toast.error('Please verify your email before logging in.');
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification(unverifiedEmail);
      toast.success('Verification email sent! Check your inbox.');
      setUnverifiedEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold">FinFlow</span>
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Unverified email banner */}
          {unverifiedEmail && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <MailCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">Email not verified</p>
                <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
                  Check your inbox or click below to resend the link.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 text-xs border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Resend verification email
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
