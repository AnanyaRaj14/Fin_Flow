'use client';

import Link from 'next/link';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { GridBackground } from '@/components/ui/background-grid';
import { ShimmerButton } from '@/components/ui/shimmer-button';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <GridBackground />
      <SpotlightCard
        radius={450}
        spotlightColor="rgba(99, 102, 241, 0.15)"
        className="w-full max-w-md p-8 text-center border-border/80 dark:border-white/10 dark:bg-[#121215]/85 backdrop-blur-xl relative z-10"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-lg">
          <TrendingUp className="w-7 h-7" />
        </div>
        <p className="text-6xl font-black font-mono tracking-tighter text-foreground/20 mb-2">404</p>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Route Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-2 mb-6">
          The requested resource is missing or has been relocated to another endpoint.
        </p>
        <div className="flex justify-center">
          <Link href="/dashboard" prefetch={false}>
            <ShimmerButton className="h-9 px-5 text-xs font-semibold gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </ShimmerButton>
          </Link>
        </div>
      </SpotlightCard>
    </div>
  );
}
