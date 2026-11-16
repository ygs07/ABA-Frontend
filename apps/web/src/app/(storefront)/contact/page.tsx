'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Clock, HelpCircle, PackageSearch, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { brand } from '@/config/brand';
import { Button } from '@/components/ui/button';

interface ContactFormState {
  name: string;
  email: string;
  topic: string;
  orderNumber: string;
  message: string;
}

const initialForm: ContactFormState = {
  name: '',
  email: '',
  topic: 'Order & Delivery',
  orderNumber: '',
  message: '',
};

const topics = [
  'Order & Delivery',
  'Payment & Wallet',
  'Referrals & Commissions',
  'Merchant Onboarding & KYC',
  'Account & Technical Support',
];

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }
    setSubmitted(true);
    toast.success('Your support request has been received.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">Contact Us</h1>
        <p className="mt-3 text-base text-text-muted">
          Have a question about an order, wallet transaction, referral commission, or merchant onboarding? Reach out to the {brand.name} support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-text">Support Email</h2>
                <a href={`mailto:${brand.supportEmail}`} className="text-sm text-brand-600 hover:underline mt-1 block">
                  {brand.supportEmail}
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-text">Office Location</h2>
                <p className="text-sm text-text-muted mt-1">Aba, Abia State, Nigeria</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-text">Support Hours</h2>
                <p className="text-sm text-text-muted mt-1">Monday – Saturday, 8:00 AM – 6:00 PM WAT</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-text">Quick Self-Service</h2>
            <Link href="/faq" className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
              <HelpCircle className="w-4 h-4" /> Browse Frequently Asked Questions
            </Link>
            <Link href="/track-order" className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
              <PackageSearch className="w-4 h-4" /> Track an Order
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-white p-6 md:p-8">
          {submitted ? (
            <div className="py-10 text-center max-w-md mx-auto">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
              <h2 className="text-xl font-bold text-text">Message Sent</h2>
              <p className="text-sm text-text-muted mt-2">
                Thank you, {form.name}. Our team will review your inquiry about <span className="font-medium text-text">{form.topic}</span> and respond to <span className="font-medium text-text">{form.email}</span>.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setForm(initialForm);
                  setSubmitted(false);
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-text">Send Us a Message</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-text">
                  Full Name
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Enter your name"
                    className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </label>

                <label className="block text-sm font-medium text-text">
                  Email Address
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-text">
                  Topic
                  <select
                    value={form.topic}
                    onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
                    className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-text">
                  Order Number (Optional)
                  <input
                    type="text"
                    value={form.orderNumber}
                    onChange={(event) => setForm((current) => ({ ...current, orderNumber: event.target.value }))}
                    placeholder="e.g. ORD-..."
                    className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-text">
                Message
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Describe how we can help..."
                  className="mt-1 w-full rounded-md border border-border bg-white p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </label>

              <Button type="submit">Submit Request</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
