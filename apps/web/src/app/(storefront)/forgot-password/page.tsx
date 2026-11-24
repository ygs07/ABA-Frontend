'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { forgotPassword } from '@/features/auth/api/auth.api';
import { forgotPasswordSchema } from '@/features/auth/schemas';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = forgotPasswordSchema.safeParse({ email: email.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email: parsed.data.email });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to request a password reset.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-1 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-text">Reset your password</h1>
        {submitted ? (
          <>
            <p className="mt-3 text-sm text-text-muted">
              If an account uses that email address, we have sent a reset link.
            </p>
            <Link
              className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline"
              href="/auth/login"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={submit}>
            <p className="text-sm text-text-muted">
              Enter your account email and we&apos;ll send you a reset link.
            </p>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <label className="block text-sm font-medium text-text">
              Email address
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full min-w-0 rounded-md border border-border bg-surface-1 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 overflow-x-auto"
                  autoComplete="email"
                  placeholder="jane.doe@example.com"
                />
              </div>
            </label>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
            <Link className="block text-center text-sm text-brand-600 hover:underline" href="/auth/login">
              Back to sign in
            </Link>
          </form>
        )}
      </section>
    </main>
  );
}
