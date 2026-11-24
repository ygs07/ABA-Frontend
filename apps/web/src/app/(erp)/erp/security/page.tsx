'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { changePasswordSchema, ChangePasswordInput } from '@/features/auth/schemas';
import { changePassword, getLoginHistory } from '@/features/auth/api/profile.api';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/patterns/DataTable';

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false); // Mock state

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema) as any,
  });

  useEffect(() => {
    getLoginHistory().then((data) => {
      setHistory(data);
      setIsHistoryLoading(false);
    });
  }, []);

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);
    try {
      await changePassword(data);
      toast.success('Password changed successfully');
      reset();
      setIsPasswordSectionOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const loginHistoryColumns = [
    { accessorKey: 'time', header: 'Time', cell: (info: any) => new Date(info.getValue()).toLocaleString() },
    { accessorKey: 'device', header: 'Device' },
    { accessorKey: 'ip', header: 'IP Address' },
    { accessorKey: 'location', header: 'Location' },
    { 
      accessorKey: 'result', 
      header: 'Result',
      cell: (info: any) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          info.getValue() === 'Success' ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
        }`}>
          {info.getValue()}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-10">
      {/* Change Password Section */}
      <section>
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-h4">Change Password</h2>
                <p className="text-sm text-text-muted mt-0.5">
                  Update your account password. Your new password cannot match your current password.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              aria-expanded={isPasswordSectionOpen}
              onClick={() => setIsPasswordSectionOpen((open) => !open)}
            >
              {isPasswordSectionOpen ? (
                <>
                  Hide <ChevronUp className="ml-1.5 h-4 w-4" />
                </>
              ) : (
                <>
                  Change Password <ChevronDown className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {isPasswordSectionOpen && (
            <div className="border-t border-border p-6 bg-surface-1">
              <form onSubmit={handleSubmit(onPasswordSubmit)} className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Current password</label>
                  <PasswordInput
                    autoComplete="current-password"
                    {...register('currentPassword')}
                  />
                  {errors.currentPassword && (
                    <p className="text-xs text-error mt-1">{errors.currentPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">New password</label>
                  <PasswordInput
                    autoComplete="new-password"
                    {...register('newPassword')}
                  />
                  {errors.newPassword && (
                    <p className="text-xs text-error mt-1">{errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Confirm new password</label>
                  <PasswordInput
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-error mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update password'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      reset();
                      setIsPasswordSectionOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Two-Factor Authentication Section */}
      {/* <section>
        <h2 className="text-h2 mb-4">Two-Factor Authentication</h2>
        <div className="bg-surface p-6 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-h4">Authenticator App</h3>
            <p className="text-body text-text-muted mt-1">
              Add an extra layer of security to your account by requiring a code from your authenticator app.
            </p>
          </div>
          <Button 
            variant={twoFactorEnabled ? 'outline' : 'primary'}
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          >
            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </div>
      </section> */}

      {/* Login History Section */}
      <section>
        <h2 className="text-h2 mb-4">Login History</h2>
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <DataTable 
            data={history} 
            columns={loginHistoryColumns} 
            isLoading={isHistoryLoading}
            emptyMessage="No login history found"
          />
        </div>
      </section>
    </div>
  );
}
