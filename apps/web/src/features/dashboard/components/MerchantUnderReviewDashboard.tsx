'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  ShieldCheck,
  Store,
  Package,
  Lock,
  ArrowRight,
  FilePenLine,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { User } from '@/features/auth/types';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/patterns/PageHeader';
import { MerchantKycRoadmap } from './MerchantKycRoadmap';

interface MerchantUnderReviewDashboardProps {
  user: User;
}

export function MerchantUnderReviewDashboard({ user }: MerchantUnderReviewDashboardProps) {
  const status = user.merchantOnboardingStatus ?? 2;
  const isRejected = status === 4;

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Merchant Dashboard"
        description={`Welcome, ${user.name || 'Merchant'}. Your account is currently in limited review mode.`}
        action={
          <Link href="/erp/onboarding">
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              View KYC Review Status
            </Button>
          </Link>
        }
      />

      {/* Primary KYC Under Review Alert Banner */}
      <div
        className={`rounded-2xl border p-6 shadow-xs ${
          isRejected
            ? 'border-error/40 bg-error-50 text-error-dark'
            : 'border-amber-200 bg-amber-50/70 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                isRejected ? 'bg-error text-white' : 'bg-amber-500 text-white'
              }`}
            >
              {isRejected ? <AlertCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-text">
                  {isRejected
                    ? 'KYC Verification Needs Attention'
                    : 'Account Under Review · KYC Verification Pending'}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isRejected ? 'bg-error text-white' : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {isRejected ? 'Action Required' : 'Minimal Access Mode'}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-muted leading-relaxed max-w-3xl">
                {isRejected
                  ? user.merchantOnboardingRejectionReason ||
                    'Your submitted onboarding documents need correction. Please review the notes and resubmit for administrator approval.'
                  : 'Your business details and KYC documents have been submitted. An administrator must verify and approve your KYC before full selling, live order processing, and payout features unlock.'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 w-full sm:w-auto">
            <Link href="/merchants/onboarding?edit=true" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto">
                <FilePenLine className="w-4 h-4 mr-1.5" />
                {isRejected ? 'Correct Submission' : 'Edit Submitted Details'}
              </Button>
            </Link>
            <Link href="/erp/onboarding" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Status Tracker
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KYC Progress Roadmap */}
      <MerchantKycRoadmap status={status} />

      {/* Minimal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Account Status</p>
          <p className="mt-2 text-xl font-bold text-amber-600 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Under Review
          </p>
          <p className="mt-1 text-xs text-text-muted">Awaiting admin KYC verification</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Storefront Visibility</p>
          <p className="mt-2 text-xl font-bold text-text flex items-center gap-2">
            <Store className="h-5 w-5 text-text-muted" />
            Hidden (Offline)
          </p>
          <p className="mt-1 text-xs text-text-muted">Goes public automatically on approval</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Product Catalog</p>
          <p className="mt-2 text-xl font-bold text-text flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-600" />
            Drafts Enabled
          </p>
          <p className="mt-1 text-xs text-text-muted">Prepare products in advance</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Orders & Revenue</p>
          <p className="mt-2 text-xl font-bold text-text-muted flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Locked
          </p>
          <p className="mt-1 text-xs text-text-muted">Active once verified</p>
        </div>
      </div>

      {/* What You Can Do Right Now (Minimal Allowed Access) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-text">What you can prepare right now</h3>
          <span className="text-xs text-text-muted">Minimal Access Capabilities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/erp/storefront/profile"
            className="group rounded-xl border border-border bg-white p-5 shadow-xs transition-all hover:border-brand-500 hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-3 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Store className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-text group-hover:text-brand-600 transition-colors">
                Set up Store Profile
              </h4>
              <p className="mt-1 text-xs text-text-muted leading-relaxed">
                Configure your store banner, merchant bio, address, and contact details for customers.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-brand-600">
              Edit Store Profile <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/erp/products"
            className="group rounded-xl border border-border bg-white p-5 shadow-xs transition-all hover:border-brand-500 hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-3 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-text group-hover:text-brand-600 transition-colors">
                Prepare Product Catalog
              </h4>
              <p className="mt-1 text-xs text-text-muted leading-relaxed">
                Add products, variants, and draft inventory so your store is ready to sell on day one.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-brand-600">
              Manage Products <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/erp/onboarding"
            className="group rounded-xl border border-border bg-white p-5 shadow-xs transition-all hover:border-brand-500 hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-text group-hover:text-amber-700 transition-colors">
                Check Verification Status
              </h4>
              <p className="mt-1 text-xs text-text-muted leading-relaxed">
                Monitor the administrator review status and view the details you submitted for KYC.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-amber-700">
              View Status Details <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Restricted Features Notice */}
      <div className="rounded-xl border border-border/70 bg-surface-1 p-5">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
          <div className="text-xs text-text-muted space-y-1">
            <p className="font-semibold text-text">Why are some features locked?</p>
            <p>
              To ensure platform security and regulatory compliance, the BuyNaija administration team must verify every merchant&apos;s CAC documents, National Identity (NIN), and verified settlement bank account. Live order checkout, settlement payouts, and public marketplace listings will activate immediately once your verification is approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
