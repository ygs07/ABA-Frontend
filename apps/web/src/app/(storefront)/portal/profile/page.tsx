 'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Lock, MapPin } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';

export default function PortalProfile() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const isCustomer = Boolean(
    isAuthenticated && user && (user.userType === 'Customer' || user.roles.includes('Customer')),
  );

  useEffect(() => {
    if (!isCustomer) router.replace('/auth/login?next=/portal/profile');
  }, [isCustomer, router]);

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
                <input type="text" defaultValue="Jane Doe" className="w-full h-10 pl-9 pr-3 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" defaultValue="jane.doe@example.com" disabled className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface-1 text-sm text-text-muted cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="tel" defaultValue="+2348012345678" className="w-full h-10 pl-9 pr-3 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button>Save Changes</Button>
          </div>
        </div>

        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text mb-4">Saved Addresses</h2>
          <div className="border border-border rounded-lg p-4 bg-surface-1 relative">
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-text-muted mt-1" />
              <div>
                <p className="font-semibold text-text">Home</p>
                <p className="text-sm text-text-muted mt-1">123 Market Street, Victoria Island</p>
                <p className="text-sm text-text-muted">Lagos, 101241, Nigeria</p>
                <p className="text-sm text-text-muted mt-2">Phone: +2348012345678</p>
              </div>
            </div>
            <div className="absolute top-4 right-4 flex gap-3">
              <button className="text-sm font-medium text-brand-600 hover:underline">Edit</button>
              <button className="text-sm font-medium text-error hover:underline">Delete</button>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline">+ Add New Address</Button>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-text mb-4">Security</h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="password" placeholder="••••••••" className="w-full h-10 pl-9 pr-3 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="password" placeholder="••••••••" className="w-full h-10 pl-9 pr-3 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <Button>Update Password</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
