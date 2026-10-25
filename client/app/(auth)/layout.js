'use client';

import React from 'react';
import { Spotlight } from '@/components/ui/spotlight';
import { GridBackground } from '@/components/ui/background-grid';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden selection:bg-foreground/10">
      {/* Aceternity Ambient Spotlight */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="rgba(255, 255, 255, 0.18)"
      />

      {/* Aceternity Grid Pattern with Radial Vignette */}
      <GridBackground pattern="grid" className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md relative z-20 py-8">
          {children}
        </div>
      </GridBackground>
    </div>
  );
}
