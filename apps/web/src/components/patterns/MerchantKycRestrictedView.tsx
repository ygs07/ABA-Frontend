'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Clock, ArrowLeft, FilePenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MerchantKycRestrictedView() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
          <Lock className="h-7 w-7" />
        </div>

        <span className="inline-block mt-4 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
          KYC Review in Progress
        </span>

        <h1 className="mt-3 text-2xl font-bold text-text">
          Feature Locked During Review
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Your merchant account is currently under compliance review. Full operational access (including live orders, customer records, commissions, and financial payouts) will unlock as soon as an administrator verifies your KYC documents.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/erp/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/erp/onboarding" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Clock className="mr-2 h-4 w-4" />
              Check Review Status
            </Button>
          </Link>
          <Link href="/merchants/onboarding?edit=true" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto text-text-muted">
              <FilePenLine className="mr-2 h-4 w-4" />
              Edit KYC Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
