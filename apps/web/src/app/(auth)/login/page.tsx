'use client';
import { brand } from '@/config/brand';


import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/features/auth/schemas';
import { getUserHome, login } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store';
import { setAuthCookie } from '@/features/auth/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { UserRole } from '@/features/auth/types';

const isMock = process.env.NEXT_PUBLIC_API_MODE === 'mock';

import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginAction = useAuthStore(state => state.login);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mockRole, setMockRole] = useState<UserRole>('Super Admin');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { 
      identifier: isMock ? `admin@${brand.domain}` : '',
      password: isMock ? 'password123' : '',
      rememberMe: false 
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await login(data);
      if (response.requires2FA) {
        router.push('/verify-2fa');
        return;
      }
      
      const roleToUse = isMock ? mockRole : response.user.userType ?? response.user.roles[0];
      if (!roleToUse) throw new Error('This user does not have an assigned user type or role.');
      await setAuthCookie(response.token, roleToUse);
      
      loginAction(response.user, roleToUse);
      
      const next = searchParams.get('next');
      router.push(next || getUserHome(response.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-h1">Welcome back</h1>
        <p className="text-body text-text-muted">Sign in to your account</p>
      </div>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {isMock && (
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg text-sm text-brand-800 space-y-2">
          <p className="font-semibold text-xs uppercase tracking-wider">Mock Mode Config</p>
          <label className="block text-xs font-medium text-brand-700">Simulate Role Login:</label>
          <select 
            value={mockRole} 
            onChange={(e) => setMockRole(e.target.value as UserRole)}
            className="w-full bg-white border border-brand-300 rounded p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Merchant">Merchant</option>
            <option value="Staff">Staff</option>
            <option value="Auditor">Auditor</option>
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address or username"
          type="text"
          {...register('identifier')}
          error={errors.identifier?.message}
          autoComplete="username"
          placeholder="you@example.com or your_username"
          autoFocus
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2 pb-4">
          <Checkbox id="rememberMe" {...register('rememberMe')} />
          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember this device
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
