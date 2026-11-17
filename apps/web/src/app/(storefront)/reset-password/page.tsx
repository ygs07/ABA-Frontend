'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { resetPassword } from '@/features/auth/api/auth.api';

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange(value: string): void }) {
  const [visible, setVisible] = useState(false);
  return <label className="block text-sm font-medium text-text">{label}<div className="relative mt-1"><Lock className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-text-muted" /><input required type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-border py-2 pl-10 pr-10" autoComplete="new-password" /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible((current) => !current)} className="absolute inset-y-0 right-0 px-3 text-text-muted">{visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></label>;
}

function ResetPasswordContent() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null);
    if (!token) return setError('This reset link is missing its token.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try { await resetPassword({ password, confirmPassword }, token); setComplete(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to reset your password.'); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-1 px-4 py-12"><section className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold text-text">Choose a new password</h1>{complete ? <><p className="mt-3 text-sm text-text-muted">Your password has been reset successfully.</p><Link className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline" href="/auth/login">Sign in</Link></> : <form className="mt-6 space-y-5" onSubmit={submit}>{error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<PasswordField label="New password" value={password} onChange={setPassword} /><PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} /><p className="text-xs text-text-muted">Use at least 10 characters, including upper- and lowercase letters and a number.</p><Button className="w-full" type="submit" disabled={loading}>{loading ? 'Resetting…' : 'Reset password'}</Button></form>}</section></main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-[calc(100vh-64px)] bg-surface-1" />}><ResetPasswordContent /></Suspense>;
}
