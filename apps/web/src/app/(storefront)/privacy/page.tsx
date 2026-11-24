import React from 'react';
import Link from 'next/link';
import { brand } from '@/config/brand';

const sections = [
  {
    id: 'information-collected',
    title: '1. Information We Collect',
    body: `When you register, shop, onboard as a merchant, or participate in referrals on ${brand.name}, we collect account details (name, email, Nigerian phone number), delivery addresses, order and payment records, and KYC/verification information required for identity and settlement compliance.`,
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    body: 'We use your information to process orders and deliveries, manage wallet balances and payouts, verify merchant and marketer identities (KYC), calculate and audit referral commissions, prevent fraud, and provide customer support.',
  },
  {
    id: 'sharing',
    title: '3. Information Sharing',
    body: 'We share necessary order and delivery details with the fulfilling merchant and delivery partners, and payment/verification details with licensed payment gateways and identity verification providers strictly to complete your transactions and regulatory checks.',
  },
  {
    id: 'security-retention',
    title: '4. Data Security & Retention',
    body: 'Authentication tokens are stored in secure HttpOnly cookies, and financial/commission ledgers are maintained with audit trails. We retain account, transaction, and compliance records for as long as needed to provide services and meet Nigerian legal and tax obligations.',
  },
  {
    id: 'your-rights',
    title: '5. Your Rights',
    body: 'Under applicable data protection laws (including the Nigeria Data Protection Act), you may request access to, correction of, or deletion of your personal data where permitted by law, and manage your profile and saved addresses from your portal.',
  },
  {
    id: 'contact',
    title: '6. Contact Us',
    body: `For privacy inquiries or data requests, email ${brand.supportEmail} or reach out through our Contact page.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-text-muted">
          Effective for {brand.name} ({brand.legalName}) · Last updated: November 2026
        </p>
      </div>

      <nav aria-label="Privacy policy sections" className="mb-8 rounded-xl border border-border bg-surface-1 p-5">
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
        <Link href="/terms" className="text-brand-600 font-medium hover:underline">
          Read Terms of Service &rarr;
        </Link>
      </div>
    </div>
  );
}
