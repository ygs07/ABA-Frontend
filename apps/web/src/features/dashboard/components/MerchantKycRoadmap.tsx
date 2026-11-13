'use client';

import React from 'react';
import { CheckCircle2, Clock, Lock } from 'lucide-react';

interface MerchantKycRoadmapProps {
  status: number;
}

export function MerchantKycRoadmap({ status }: MerchantKycRoadmapProps) {
  const isRejected = status === 4;

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-xs">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
        Onboarding & KYC Verification Roadmap
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-1 border border-border/80">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-main text-white text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">1. Registration</p>
            <p className="text-xs text-text-muted mt-0.5">Account created</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-1 border border-border/80">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-main text-white text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">2. KYC Submitted</p>
            <p className="text-xs text-text-muted mt-0.5">CAC, NIN & Bank info</p>
          </div>
        </div>

        {/* Step 3 */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-lg border ${
            isRejected
              ? 'bg-error-50 border-error/40'
              : 'bg-amber-50 border-amber-300'
          }`}
        >
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${
              isRejected ? 'bg-error' : 'bg-amber-500 animate-pulse'
            }`}
          >
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p
              className={`text-sm font-semibold ${
                isRejected ? 'text-error-dark' : 'text-amber-950'
              }`}
            >
              3. Admin Review
            </p>
            <p
              className={`text-xs mt-0.5 font-medium ${
                isRejected ? 'text-error' : 'text-amber-800'
              }`}
            >
              {isRejected ? 'Needs correction' : 'In progress (24-48h)'}
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-1 border border-border/50 opacity-60">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted text-xs font-bold">
            <Lock className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">4. Live Storefront</p>
            <p className="text-xs text-text-muted mt-0.5">Unlocks after approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}
