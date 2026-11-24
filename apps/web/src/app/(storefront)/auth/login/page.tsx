'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Mail } from 'lucide-react';
import { brand } from '@/config/brand';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { getUserHome, login as loginRequest } from '@/features/auth/api/auth.api';
import { buildAuthHref, sanitizeNextPath } from '@/features/auth/redirect';
import { useAuthStore } from '@/features/auth/store';
import { setAuthCookie } from '@/features/auth/actions';

const isMock = process.env.NEXT_PUBLIC_API_MODE === 'mock';

function StorefrontLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get('next'));
  const login = useAuthStore((state) => state.login);

  const [identifier, setIdentifier] = useState(isMock ? 'jane.doe@example.com' : '');
  const [password, setPassword] = useState(isMock ? 'password123' : '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginRequest({ identifier: identifier.trim(), password, rememberMe });
      const role = response.user.userType ?? response.user.roles[0];
      if (!role) throw new Error('This user does not have an assigned user type or role.');
      await setAuthCookie(response.token, role, rememberMe);
      login(response.user, role);
      if (!rememberMe) {
        window.localStorage.removeItem('aba_ui_auth_state');
      }
      router.push(nextPath ?? getUserHome(response.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-surface-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-border">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-text tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-text-muted">
            Sign in to your {brand.name} account to manage orders, referrals, and your wallet.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5 min-w-0">
              <p className="font-semibold">Unable to sign in</p>
              <p className="text-xs leading-relaxed text-error/90">{error}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="min-w-0">
              <label htmlFor="login-identifier" className="block text-sm font-medium text-text mb-1">
                Email address or username
              </label>
              <div className="relative min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full min-w-0 pl-10 pr-4 py-2.5 border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface-1 sm:text-sm overflow-x-auto"
                  placeholder="jane.doe@example.com or jane_doe"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-password" className="block text-sm font-medium text-text">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <PasswordInput
                id="login-password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-2.5"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-border rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-text-muted">
              Remember me on this device
            </label>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-text-muted">Don&apos;t have an account?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={buildAuthHref('/auth/register', nextPath)}
              className="w-full flex justify-center py-2 px-4 border border-brand-600 rounded-md shadow-sm text-sm font-medium text-brand-600 bg-white hover:bg-brand-50 transition-colors focus:outline-none"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] bg-surface-1" />}>
      <StorefrontLoginContent />
    </Suspense>
  );
}
