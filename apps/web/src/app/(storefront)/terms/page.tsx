import React from 'react';
import Link from 'next/link';
import { brand } from '@/config/brand';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: `By accessing or using ${brand.name} (operated by ${brand.legalName}), including our storefront, customer portal, merchant tools, and referral program, you agree to be bound by these Terms of Service and our Privacy Policy.`,
  },
  {
    id: 'accounts',
    title: '2. Accounts & Security',
    body: 'You are responsible for providing accurate registration details, maintaining the confidentiality of your password, and all activity under your account. Notify us immediately if you suspect unauthorized access.',
  },
  {
    id: 'orders-payments',
    title: '3. Orders, Payments & Delivery',
    body: 'All prices are listed in Nigerian Naira (₦). Orders are subject to product availability and payment confirmation via supported gateways, Wallet balance, or Shopping Credits. Delivery timelines vary by location and selected delivery method.',
  },
  {
    id: 'merchants-kyc',
    title: '4. Merchant Onboarding & KYC',
    body: 'Merchants must complete onboarding and KYC verification (including business registration or provisional grace-period requirements and identity verification) before receiving full marketplace selling and settlement privileges.',
  },
  {
    id: 'referrals-commissions',
    title: '5. Referrals & Commissions',
    body: 'Commission earnings are governed by the active platform commission plan, qualification triggers, holding periods, and approval rules. Fraudulent self-referrals, manipulation, or reversed/refunded orders may result in commission reversal or account suspension.',
  },
  {
    id: 'returns-disputes',
    title: '6. Returns, Refunds & Disputes',
    body: 'Eligible returns and refunds are processed in accordance with marketplace fulfillment standards. Approved refunds may be credited to the original payment method or your platform wallet.',
  },
  {
    id: 'changes-contact',
    title: '7. Updates & Contact',
    body: `We may update these Terms from time to time. Continued use of ${brand.name} after updates constitutes acceptance. For questions, contact us at ${brand.supportEmail}.`,
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-text-muted">
          Effective for {brand.name} ({brand.legalName}) · Last updated: November 2026
        </p>
      </div>

      <nav aria-label="Terms sections" className="mb-8 rounded-xl border border-border bg-surface-1 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          Contents
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-brand-600 hover:underline">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28 space-y-2">
            <h2 className="text-xl font-bold text-text">{section.title}</h2>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
        <span>
          Questions?{' '}
          <Link href="/contact" className="text-brand-600 font-medium hover:underline">
            Contact Support
          </Link>
        </span>
        <Link href="/privacy" className="text-brand-600 font-medium hover:underline">
          Read Privacy Policy &rarr;
        </Link>
      </div>
    </div>
  );
}
