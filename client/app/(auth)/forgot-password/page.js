'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '@/services/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Logo } from '@/components/ui/logo';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent if the email exists.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-center pb-4 pt-6 px-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Forgot password</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your email and we&apos;ll send a secure reset link
          </p>
        </div>

        <div className="space-y-4 px-6 pb-6">
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Check your inbox for the password reset instructions.
              </p>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full text-xs h-9">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Email Address</Label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9 text-xs h-10 bg-background/50 border-border/80 focus:border-primary/50"
                    {...register('email', { required: 'Email is required' })}
                  />
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
              </div>

              <Button type="submit" className="w-full text-xs h-10 shadow-sm" disabled={loading}>
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Send Reset Link
              </Button>

              <Link href="/login" className="block text-center pt-2">
                <Button variant="ghost" className="w-full text-xs h-9 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to sign in
                </Button>
              </Link>
            </form>
          )}
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
