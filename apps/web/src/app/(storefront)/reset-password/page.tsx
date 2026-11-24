'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { resetPassword } from '@/features/auth/api/auth.api';
import { resetPasswordSchema } from '@/features/auth/schemas';

function ResetPasswordContent() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!token) return setError('This reset link is missing its token.');

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      return setError(parsed.error.issues[0]?.message ?? 'Please check your new password.');
    }

    setLoading(true);
    try {
      await resetPassword({ password, confirmPassword }, token);
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to reset your password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-1 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-text">Choose a new password</h1>
        {complete ? (
          <>
            <p className="mt-3 text-sm text-text-muted">Your password has been reset successfully.</p>
            <Link
              className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline"
              href="/auth/login"
            >
              Sign in
            </Link>
          </>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={submit}>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text">New password</label>
              <PasswordInput
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text">Confirm new password</label>
              <PasswordInput
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
            <p className="text-xs text-text-muted">
              Use at least 10 characters, including upper- and lowercase letters and a number.
            </p>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-[calc(100vh-64px)] bg-surface-1" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
