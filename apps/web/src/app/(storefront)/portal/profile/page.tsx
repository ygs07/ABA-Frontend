 'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { User, Mail, Phone, Lock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { changePasswordSchema } from '@/features/auth/schemas';
import { useAuthStore } from '@/features/auth/store';
import { fetchApi } from '@/lib/api';
import { DeliveryAddress, getDeliveryAddresses } from '@/features/checkout/api';
import { NIGERIAN_STATES } from '@/lib/constants/nigeria';
import { toast } from 'sonner';
import { changePassword, updateProfile } from '@/features/auth/api/profile.api';

const emptyAddress = { name: '', street: '', city: '', state: '', zip: '' };

export default function PortalProfile() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const isCustomer = Boolean(
    isAuthenticated && user && (user.userType === 'Customer' || user.roles.includes('Customer')),
  );

  useEffect(() => {
    if (!isCustomer) router.replace('/auth/login?next=/portal/profile');
  }, [isCustomer, router]);

  const loadAddresses = async () => {
    try {
      const response = await getDeliveryAddresses();
      setAddresses(response.data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load saved addresses.');
    }
  };

  useEffect(() => {
    if (isCustomer) void loadAddresses();
  }, [isCustomer]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone ?? '');
  }, [user]);

  const saveProfile = async () => {
    if (!name.trim()) return toast.error('Your name is required.');
    setIsSavingProfile(true);
    try {
      await updateProfile({ name, phone, email: user?.email ?? '', language: 'English', timezone: 'Africa/Lagos' });
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async () => {
    const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message ?? 'Please check your password details.');
    }
    setIsSavingPassword(true);
    try {
      await changePassword(parsed.data);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSecurityOpen(false);
      toast.success('Password updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const openAddressForm = (address?: DeliveryAddress) => {
    setEditingAddressId(address?.id ?? null);
    setAddressForm(address
      ? { name: address.name, street: address.street, city: address.city, state: address.state, zip: address.zip }
      : emptyAddress);
    setIsAddressFormOpen(true);
  };

  const saveAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingAddress(true);
    try {
      await fetchApi(`/api/v1/delivery-address${editingAddressId ? `/${editingAddressId}` : ''}`, {
        method: editingAddressId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });
      toast.success(editingAddressId ? 'Address updated.' : 'Address added.');
      setIsAddressFormOpen(false);
      await loadAddresses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const deleteAddress = async (addressId: number) => {
    if (!window.confirm('Delete this saved address?')) return;
    try {
      await fetchApi(`/api/v1/delivery-address/${addressId}`, { method: 'DELETE' });
      setAddresses((currentAddresses) => currentAddresses.filter((address) => address.id !== addressId));
      toast.success('Address deleted.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete address.');
    }
  };

  if (!isCustomer) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Profile Settings</h1>
      
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="w-full h-10 pl-9 pr-3 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" value={user?.email ?? ''} disabled className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface-1 text-sm text-text-muted cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full h-10 pl-9 pr-3 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={saveProfile} disabled={isSavingProfile}>{isSavingProfile ? 'Saving…' : 'Save Changes'}</Button>
          </div>
        </div>

        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text mb-4">Saved Addresses</h2>
          <div className="space-y-3">
            {addresses.length === 0 ? <p className="rounded-lg border border-dashed border-border p-4 text-sm text-text-muted">No saved addresses yet.</p> : addresses.map((address) => (
              <div key={address.id} className="border border-border rounded-lg p-4 bg-surface-1 relative">
                <div className="flex items-start gap-4 pr-20"><MapPin className="w-5 h-5 text-text-muted mt-1" /><div><p className="font-semibold text-text">{address.name}</p><p className="text-sm text-text-muted mt-1">{address.street}</p><p className="text-sm text-text-muted">{address.city}, {address.state}, {address.zip}</p></div></div>
                <div className="absolute top-4 right-4 flex gap-3"><button type="button" onClick={() => openAddressForm(address)} className="text-sm font-medium text-brand-600 hover:underline">Edit</button><button type="button" onClick={() => void deleteAddress(address.id)} className="text-sm font-medium text-error hover:underline">Delete</button></div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => openAddressForm()}>+ Add New Address</Button>
          </div>
          {isAddressFormOpen && <form onSubmit={saveAddress} className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border p-4 md:grid-cols-2">
            {Object.entries({ name: 'Label', street: 'Street address', city: 'City', state: 'State', zip: 'Postal code' }).map(([field, label]) => (
              <label key={field} className="text-sm font-medium text-text">
                {label}
                {field === 'state' ? (
                  <select
                    required
                    value={addressForm.state}
                    onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))}
                    aria-label="State"
                    className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input required value={addressForm[field as keyof typeof addressForm]} onChange={(event) => setAddressForm((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 h-10 w-full rounded-md border border-border px-3 text-sm" />
                )}
              </label>
            ))}
            <div className="flex items-end gap-2"><Button type="submit" disabled={isSavingAddress}>{isSavingAddress ? 'Saving…' : editingAddressId ? 'Update address' : 'Save address'}</Button><Button type="button" variant="outline" onClick={() => setIsAddressFormOpen(false)}>Cancel</Button></div>
          </form>}
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text">Security</h2>
                <p className="text-sm text-text-muted">
                  Change your account password. Your new password must be different from your current password.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              aria-expanded={isSecurityOpen}
              onClick={() => setIsSecurityOpen((open) => !open)}
            >
              {isSecurityOpen ? (
                <>
                  Hide <ChevronUp className="ml-1.5 w-4 h-4" />
                </>
              ) : (
                <>
                  Change Password <ChevronDown className="ml-1.5 w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {isSecurityOpen && (
            <div className="mt-6 max-w-md space-y-4 border-t border-border pt-6">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Current Password</label>
                <PasswordInput
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">New Password</label>
                <PasswordInput
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Confirm New Password</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={savePassword}
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {isSavingPassword ? 'Updating…' : 'Update Password'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSecurityOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
