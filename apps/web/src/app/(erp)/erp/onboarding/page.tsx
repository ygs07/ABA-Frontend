'use client';

import Link from 'next/link';
import { Clock3, FilePenLine, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/components/ui/button';

const statusCopy: Record<number, { title: string; body: string }> = {
  1: {
    title: 'Your onboarding application is in progress',
    body: 'We have received your merchant onboarding application. You can review and update the submitted details while our team prepares it for review.',
  },
  2: {
    title: 'Your onboarding application is under review',
    body: 'Our team is reviewing your business details, documents, and settlement information. You can still update your submission if anything changes.',
  },
  4: {
    title: 'Your onboarding application needs attention',
    body: 'Please update your application and submit the corrected details for another review.',
  },
};

export default function MerchantOnboardingProgressPage() {
  const user = useAuthStore((state) => state.user);
  const status = user?.merchantOnboardingStatus ?? 1;
  const content = statusCopy[status] ?? statusCopy[1];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          {status === 4 ? <FilePenLine className="h-7 w-7" /> : <Clock3 className="h-7 w-7" />}
        </div>
        <h1 className="mt-5 text-2xl font-bold text-text">{content.title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-muted">{content.body}</p>
        {status === 4 && user?.merchantOnboardingRejectionReason && (
          <p className="mt-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error">Review note: {user.merchantOnboardingRejectionReason}</p>
        )}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/merchants/onboarding?edit=true"><Button><FilePenLine className="mr-2 h-4 w-4" />Edit submitted details</Button></Link>
          <div className="flex items-center justify-center gap-2 px-3 text-xs text-text-muted"><ShieldCheck className="h-4 w-4 text-success-main" />Merchant tools unlock after approval.</div>
        </div>
      </section>
    </main>
  );
}
