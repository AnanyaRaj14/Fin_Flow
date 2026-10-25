'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '@/services/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Logo } from '@/components/ui/logo';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async ({ password }) => {
    if (!token) return toast.error('Invalid reset link.');
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset! You can now log in.');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">New Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            className="pl-9 pr-9 text-xs h-10 bg-background/50 border-border/80 focus:border-primary/50"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
            })}
          />
          <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Confirm Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat new password"
            className="pl-9 text-xs h-10 bg-background/50 border-border/80 focus:border-primary/50"
            {...register('confirm', {
              required: 'Please confirm your password',
              validate: (v) => v === watch('password') || 'Passwords do not match',
            })}
          />
          <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {errors.confirm && <p className="text-[11px] text-destructive">{errors.confirm.message}</p>}
      </div>

      <Button type="submit" className="w-full text-xs h-10 shadow-sm" disabled={loading}>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
        Reset Password
      </Button>

      <Link href="/login" prefetch={false} className="block text-center pt-2">
        <Button variant="ghost" className="w-full text-xs h-9 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to sign in
        </Button>
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Set new password</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a strong password for your FinFlow account
          </p>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <Suspense fallback={<div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
