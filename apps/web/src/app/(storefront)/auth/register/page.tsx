'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Mail, Phone, User } from 'lucide-react';
import { brand } from '@/config/brand';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getUserHome, signup } from '@/features/auth/api/auth.api';
import { buildAuthHref, sanitizeNextPath } from '@/features/auth/redirect';
import { SignupInput, signupSchema } from '@/features/auth/schemas';
import { ReferralSignupField } from '@/features/auth/components/ReferralSignupField';
import { setAuthCookie } from '@/features/auth/actions';
import { useAuthStore } from '@/features/auth/store';

interface RegistrationIssue {
  field: string;
  label: string;
  message: string;
}

const FIELD_LABELS: Record<string, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  middle_name: 'Middle name',
  email: 'Email address',
  phone: 'Phone number',
  password: 'Password',
  confirm_password: 'Confirm password',
  referralCode: 'Referral code',
  acceptTerms: 'Terms & Privacy Policy',
};

function StorefrontRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCodeParam = searchParams.get('ref') || searchParams.get('referrer') || '';
  const nextPath = sanitizeNextPath(searchParams.get('next'));
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    referralCode: refCodeParam,
    acceptTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [issues, setIssues] = useState<RegistrationIssue[]>([]);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const collectedIssues: RegistrationIssue[] = [];
    const parsed = signupSchema.safeParse(formData);

    if (!parsed.success) {
      const seen = new Set<string>();
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? 'form');
        const dedupeKey = `${field}:${issue.message}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        collectedIssues.push({
          field,
          label: FIELD_LABELS[field] ?? 'Form',
          message: issue.message,
        });
      }
    }

    if (!formData.acceptTerms) {
      collectedIssues.push({
        field: 'acceptTerms',
        label: FIELD_LABELS.acceptTerms,
        message: 'You must agree to the Terms of Service and Privacy Policy.',
      });
    }

    if (collectedIssues.length > 0) {
      setIssues(collectedIssues);
      setIsErrorDialogOpen(true);
      return;
    }

    if (!parsed.success) return;

    setIssues([]);
    setIsLoading(true);
    try {
      const response = await signup(parsed.data satisfies SignupInput);
      const role = response.user.userType ?? response.user.roles[0] ?? 'Customer';
      await setAuthCookie(response.token, role);
      login(response.user, role);
      router.push(nextPath ?? getUserHome(response.user));
    } catch (err) {
      setIssues([
        {
          field: 'form',
          label: 'Registration error',
          message: err instanceof Error ? err.message : 'Unable to create your account.',
        },
      ]);
      setIsErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-surface-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-border">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-text tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-text-muted">
            Join the {brand.name} community. Shop, refer friends, and earn commissions.
          </p>
        </div>

        <form noValidate className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">First name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="block w-full min-w-0 pl-10 pr-3 py-2 border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface-1 sm:text-sm"
                  placeholder="Jane"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Middle name (Optional)</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  className="block w-full min-w-0 px-3 py-2 border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface-1 sm:text-sm"
                  placeholder="Ada"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Last name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="block w-full min-w-0 px-3 py-2 border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface-1 sm:text-sm"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full min-w-0 pl-10 pr-3 py-2 border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface-1 sm:text-sm"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Phone number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full min-w-0 pl-10 pr-3 py-2 border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface-1 sm:text-sm"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Password</label>
                <PasswordInput
                  name="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-text-muted">
                  At least 8 characters including letters and numbers.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Confirm Password</label>
                <PasswordInput
                  name="confirm_password"
                  autoComplete="new-password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <ReferralSignupField
              value={formData.referralCode}
              onChange={(val) => setFormData((prev) => ({ ...prev, referralCode: val }))}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-border rounded"
              />
            </div>
            <div className="ml-2 text-sm">
              <label htmlFor="acceptTerms" className="text-text-muted">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-brand-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-brand-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link href={buildAuthHref('/auth/login', nextPath)} className="font-medium text-brand-600 hover:underline">
            Log in instead
          </Link>
        </div>
      </div>

      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-error">
              <AlertCircle className="h-5 w-5 shrink-0" />
              Please fix the following errors
            </DialogTitle>
            <DialogDescription>
              Review all highlighted items below before creating your account.
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-error/20 bg-error/5 p-3 text-xs text-text">
            {issues.map((issue, idx) => (
              <li key={`${issue.field}-${idx}`} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-error shrink-0" />
                <span>
                  <strong className="font-semibold">{issue.label}:</strong> {issue.message}
                </span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button type="button" onClick={() => setIsErrorDialogOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function StorefrontRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] bg-surface-1" />}>
      <StorefrontRegisterContent />
    </Suspense>
  );
}
