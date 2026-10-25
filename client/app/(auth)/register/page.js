'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Logo } from '@/components/ui/logo';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await authApi.register(data);
      toast.success('Account created! Please check your email to verify.');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setSubmitting(false);
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

      <SpotlightCard
        radius={420}
        spotlightColor="rgba(99, 102, 241, 0.16)"
        className="p-0 border-border/70 dark:border-white/[0.1] dark:bg-[#121215]/85 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center pb-4 pt-6 px-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Create your account</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Start managing your wealth, cash flow, and budgets
          </p>
        </div>
        <div className="space-y-4 px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Full Name</Label>
              <div className="relative">
                <Input
                  placeholder="Alex Mercer"
                  className="h-10 rounded-xl pl-9 text-xs dark:bg-white/[0.03] dark:border-white/10"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                />
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Email Address</Label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-10 rounded-xl pl-9 text-xs dark:bg-white/[0.03] dark:border-white/10"
                  {...register('email', { required: 'Email is required' })}
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className="h-10 rounded-xl pl-9 pr-9 text-xs dark:bg-white/[0.03] dark:border-white/10"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
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

            <ShimmerButton type="submit" className="w-full h-10 rounded-xl font-medium text-xs gap-2" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </ShimmerButton>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Already have an account?{' '}
            <Link href="/login" prefetch={false} className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
