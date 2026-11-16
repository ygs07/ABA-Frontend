'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Store, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingSuccessProps {
  isProvisional: boolean;
}

export function OnboardingSuccess({ isProvisional }: OnboardingSuccessProps) {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center animate-in fade-in duration-500">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isProvisional ? 'bg-amber-100 text-amber-700' : 'bg-success-100 text-success-main'
          }`}
      >
        {isProvisional ? <Clock className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
      </div>

      <div className="space-y-3">
        <div className="inline-block">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${isProvisional
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-brand-50 text-brand-700 border border-brand-200'
              }`}
          >
            {isProvisional ? 'Provisional Status • 60 Days Remaining' : 'Status: Under Admin Review'}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-text tracking-tight">
          {isProvisional ? 'Provisional Storefront Created!' : 'Application Submitted for Review!'}
        </h1>

        <p className="text-sm text-text-muted leading-relaxed max-w-md mx-auto">
          {isProvisional
            ? 'Welcome to Naijahands! Your store is provisionally active. Please complete and submit your CAC registration within 60 days to unlock full verified merchant status.'
            : 'Our verification team is reviewing your CAC, NIN, and workshop details. Verification typically completes within 24–48 hours.'}
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/erp/dashboard" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto font-bold rounded-xl px-7">
            <Store className="w-4 h-4 mr-2" />
            Open Merchant Hub
          </Button>
        </Link>
        <Link href="/" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl px-7">
            Explore Marketplace <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
