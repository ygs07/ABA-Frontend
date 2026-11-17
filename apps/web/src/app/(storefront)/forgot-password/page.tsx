'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { forgotPassword } from '@/features/auth/api/auth.api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword({ email });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to request a password reset.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-1 px-4 py-12"><section className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-bold text-text">Reset your password</h1>
    {submitted ? <><p className="mt-3 text-sm text-text-muted">If an account uses that email address, we have sent a reset link.</p><Link className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline" href="/auth/login">Back to sign in</Link></> : <form className="mt-6 space-y-5" onSubmit={submit}>
      <p className="text-sm text-text-muted">Enter your account email and we’ll send you a reset link.</p>
      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <label className="block text-sm font-medium text-text">Email address<div className="relative mt-1"><Mail className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-text-muted" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-border py-2 pl-10 pr-3" autoComplete="email" /></div></label>
      <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
      <Link className="block text-center text-sm text-brand-600 hover:underline" href="/auth/login">Back to sign in</Link>
    </form>}
  </section></main>;
}
