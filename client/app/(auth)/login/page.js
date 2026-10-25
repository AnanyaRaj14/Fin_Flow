'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, TrendingUp, Loader2, MailCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

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
        setUnverifiedEmail(data.email);
        toast.error('Please verify your email before logging in.');
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
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
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
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

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <Link href="/dashboard" prefetch={false} className="mb-3 inline-block">
          <Logo size="lg" />
        </Link>
        <p className="text-xs text-muted-foreground font-medium">Simple, quiet financial clarity</p>
      </div>

      <SpotlightCard className="p-0 border-border/70 dark:border-white/[0.1] dark:bg-[#121215]/85 backdrop-blur-xl shadow-2xl">
        <div className="text-center pb-4 pt-6 px-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Welcome back</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your credentials to access your financial portfolio
          </p>
        </div>
        <div className="space-y-4 px-6 pb-6">
          {/* Unverified email notification banner */}
          {unverifiedEmail && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <MailCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-semibold text-amber-600 dark:text-amber-300">Email verification required</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Check your inbox for the link or click below to receive a new one.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2.5 h-7 text-xs border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 rounded-lg"
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
              <Label className="text-xs font-medium text-foreground">Email Address</Label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-10 rounded-xl pl-9 text-xs dark:bg-white/[0.03] dark:border-white/10"
                  {...register('email', { required: 'Email address is required' })}
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">Password</Label>
                <Link href="/forgot-password" prefetch={false} className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-10 rounded-xl pl-9 pr-9 text-xs dark:bg-white/[0.03] dark:border-white/10"
                  {...register('password', { required: 'Password is required' })}
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-10 rounded-xl font-medium text-xs gap-2 shadow-xs" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" prefetch={false} className="text-foreground font-medium hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}