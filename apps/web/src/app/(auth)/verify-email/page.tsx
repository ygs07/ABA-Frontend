'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, MailX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api';

type VerificationState = 'checking' | 'verified' | 'invalid';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>('checking');
  const [email, setEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }

    let isMounted = true;
    void fetchApi(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => {
        if (isMounted) setState('verified');
      })
      .catch(() => {
        if (isMounted) setState('invalid');
      });
    return () => {
      isMounted = false;
    };
  }, [token]);

  if (state === 'checking') {
    return <div className="flex w-full flex-col items-center gap-4 py-10 text-center"><Loader2 className="h-10 w-10 animate-spin text-brand-600" /><p className="text-text-muted">Verifying your email address…</p></div>;
  }

  if (state === 'verified') {
    return <div className="flex w-full flex-col items-center gap-4 py-10 text-center"><CheckCircle2 className="h-12 w-12 text-success" /><h1 className="text-h2">Email verified</h1><p className="text-text-muted">Your email address has been verified successfully. You can now continue to your account.</p><Link href="/login"><Button>Sign in</Button></Link></div>;
  }

  const resend = async () => {
    if (!email.trim()) return;
    setIsResending(true);
    try {
      await fetchApi('/api/v1/auth/resend-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setResendMessage('If that address needs verification, a fresh link has been sent.');
    } catch {
      setResendMessage('We could not send a verification link. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return <div className="flex w-full flex-col items-center gap-4 py-10 text-center"><MailX className="h-12 w-12 text-error" /><h1 className="text-h2">Verification link is invalid or expired</h1><p className="text-text-muted">Request a fresh verification link and try again.</p><div className="w-full max-w-sm space-y-3 text-left"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email address" /><Button className="w-full" disabled={!email.trim() || isResending} onClick={() => void resend()}>{isResending ? 'Sending…' : 'Resend verification link'}</Button>{resendMessage && <p className="text-center text-sm text-text-muted">{resendMessage}</p>}</div><Link href="/login"><Button variant="outline">Back to sign in</Button></Link></div>;
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="py-10 text-center text-text-muted">Loading verification…</div>}><VerifyEmailContent /></Suspense>;
}
