'use client';
import { brand } from '@/config/brand';


import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Wallet, Users, Settings, Bell, LogOut, Medal, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { getUserHome, logout as logoutRequest } from '@/features/auth/api/auth.api';
import { removeAuthCookie } from '@/features/auth/actions';
import { useQuery } from '@tanstack/react-query';
import { getOwnKycProfile } from '@/features/portal/api';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isCustomer = Boolean(
    user && (user.userType === 'Customer' || user.roles.includes('Customer')),
  );
  const { data: kycProfile } = useQuery({
    queryKey: ['portal_referral_kyc_profile'],
    queryFn: getOwnKycProfile,
    enabled: isCustomer,
  });
  const needsReferralKyc = isCustomer && kycProfile?.status !== 3;

  React.useEffect(() => {
    if (user && !isCustomer) {
      router.replace(getUserHome(user));
    }
  }, [isCustomer, router, user]);

  const handleSignOut = async () => {
    try {
      await logoutRequest();
    } finally {
      await removeAuthCookie();
      logout();
      router.push('/');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/portal/orders', icon: ShoppingBag },
    { name: 'My Wallet', href: '/portal/wallet', icon: Wallet },
    { name: 'Referrals', href: '/portal/referrals', icon: Users },
    { name: 'KYC Profile', href: '/portal/kyc', icon: ShieldCheck },
    { name: 'Rewards', href: '/portal/rewards', icon: Medal },
    ...(isCustomer ? [{ name: 'Profile', href: '/portal/profile', icon: Settings }] : []),
    { name: 'Notifications', href: '/portal/notifications', icon: Bell },
    // saved-sellers
  ];

  return (
    <div className="bg-surface-1 min-h-[calc(100vh-64px)] mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Portal Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm lg:sticky lg:top-24 mb-6 lg:mb-0">
              <div className="hidden lg:block p-6 border-b border-border bg-brand-50">
                <div className="w-16 h-16 bg-brand-200 rounded-full flex items-center justify-center text-brand-700 text-xl font-bold mb-3 uppercase">
                  {user?.firstName?.[0] || 'J'}{user?.lastName?.[0] || 'D'}
                </div>
                <h2 className="text-lg font-bold text-text capitalize">{user?.firstName || 'Jane'} {user?.lastName || 'Doe'}</h2>
                <p className="text-sm text-text-muted">{user?.email || 'jane.doe@example.com'}</p>
                <div className="mt-2 text-xs font-semibold px-2 py-1 bg-white text-brand-700 inline-block rounded border border-brand-200">
                  Referral: {user?.referralCode || `${brand.referralCodePrefix}${user?.firstName?.toUpperCase() || 'JANE'}-123`}
                </div>
              </div>
              
              <nav className="flex overflow-x-auto lg:flex-col p-2 gap-2 lg:gap-1 scrollbar-hide">
                {navItems.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                        isActive 
                          ? 'bg-brand-50 text-brand-700' 
                          : 'text-text hover:bg-surface-2 hover:text-brand-600'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'text-brand-600' : 'text-text-muted'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden lg:block p-4 border-t border-border mt-2">
                <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-2 text-sm font-medium text-error hover:underline cursor-pointer">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Portal Content Area */}
          <main className="flex-1">
            {needsReferralKyc && pathname !== '/portal/referrals' && (
              <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-semibold">Activate your referral earning account</p>
                <p className="mt-1 text-amber-900">Complete referral KYC and the one-time activation payment to unlock referral commissions and shopping credits.</p>
                <Link href="/portal/referrals" className="mt-2 inline-block font-semibold text-brand-700 hover:underline">Complete referral activation →</Link>
              </div>
            )}
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
