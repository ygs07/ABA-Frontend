'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Plus, HelpCircle, Menu, ChevronRight } from 'lucide-react';
import { brand } from '@/config/brand';
import { Sidebar } from './Sidebar';
import { MerchantKycRestrictedView } from './MerchantKycRestrictedView';
import { useAuthStore } from '@/features/auth/store';
import { removeAuthCookie } from '@/features/auth/actions';
import { logout as logoutRequest } from '@/features/auth/api/auth.api';
import { isMerchantUnderReview, isAllowedPathForMerchantUnderReview } from '@/features/auth/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const paths = pathname?.split('/').filter(Boolean) || [];
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const user = useAuthStore(state => state.user);
  const activeRole = useAuthStore(state => state.activeRole);
  const logout = useAuthStore(state => state.logout);
  const isRestrictedMerchantRoute = isMerchantUnderReview(user) && !isAllowedPathForMerchantUnderReview(pathname);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await logoutRequest();
    } finally {
      await removeAuthCookie();
      logout();
      router.push('/login');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen w-full bg-bg">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header ref={headerRef} className="h-16 shrink-0 bg-white border-b border-border flex items-center px-4 justify-between sticky top-0 z-10">
          {/* Left: Breadcrumbs & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button className="md:hidden text-text-muted hover:text-text">
              <Menu className="w-5 h-5" />
            </button>
            <nav className="hidden sm:flex items-center text-sm">
              <Link href="/dashboard" className="text-text-muted hover:text-text font-medium">Home</Link>
              {paths.map((p, i) => {
                const isLast = i === paths.length - 1;
                const formatted = p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ');
                return (
                  <React.Fragment key={p}>
                    <ChevronRight className="w-4 h-4 text-text-muted mx-1" />
                    {isLast ? (
                      <span className="font-semibold text-text">{formatted}</span>
                    ) : (
                      <Link href={`/${paths.slice(0, i + 1).join('/')}`} className="text-text-muted hover:text-text font-medium">
                        {formatted}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within:text-brand-600 transition-colors" />
              <input
                type="text"
                placeholder="Search orders, customers, or products..."
                className="w-full h-9 pl-9 pr-12 rounded-md border border-border bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all placeholder:text-text-subtle"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-text-muted bg-white border border-border rounded opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            
            {/* Quick Create Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'create' ? null : 'create')}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              {openDropdown === 'create' && (
                <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-md border border-border py-1 z-50">
                  <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Quick Create</div>
                  {isMerchantUnderReview(user) ? (
                    <>
                      <Link href="/erp/products/new" className="block px-4 py-2 text-sm hover:bg-surface-2">New Product Draft</Link>
                      <Link href="/erp/storefront/profile" className="block px-4 py-2 text-sm hover:bg-surface-2">Store Profile</Link>
                    </>
                  ) : (
                    <>
                      <Link href="/erp/orders/new" className="block px-4 py-2 text-sm hover:bg-surface-2">New Order</Link>
                      <Link href="/erp/customers/new" className="block px-4 py-2 text-sm hover:bg-surface-2">New Customer</Link>
                      <Link href="/erp/products/new" className="block px-4 py-2 text-sm hover:bg-surface-2">New Product</Link>
                      <div className="h-px bg-border my-1"></div>
                      <Link href="/erp/procurement/requests/new" className="block px-4 py-2 text-sm hover:bg-surface-2">Purchase Request</Link>
                      <Link href="/erp/production/new" className="block px-4 py-2 text-sm hover:bg-surface-2">Production Order</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Help Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'help' ? null : 'help')}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              {openDropdown === 'help' && (
                <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-md border border-border py-1 z-50">
                  <Link href="#" className="block px-4 py-2 text-sm hover:bg-surface-2">Documentation</Link>
                  <Link href="#" className="block px-4 py-2 text-sm hover:bg-surface-2">Contact Support</Link>
                  <Link href="#" className="block px-4 py-2 text-sm hover:bg-surface-2">Keyboard Shortcuts</Link>
                </div>
              )}
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'notifications' ? null : 'notifications')}
                className="relative flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error ring-2 ring-white"></span>
              </button>
              {openDropdown === 'notifications' && (
                <div className="absolute right-0 top-10 w-[350px] bg-white rounded-lg shadow-lg border border-border z-50 flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button className="text-xs text-brand-600 hover:underline">Mark all read</button>
                  </div>
                  <div className="flex border-b border-border text-sm px-4">
                    <button className="px-3 py-2 border-b-2 border-brand-500 font-medium text-brand-600">All</button>
                    <button className="px-3 py-2 text-text-muted hover:text-text">Approvals</button>
                    <button className="px-3 py-2 text-text-muted hover:text-text">Alerts</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="p-4 hover:bg-surface-2 cursor-pointer border-b border-border flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-warning-bg flex items-center justify-center shrink-0">
                        <span className="text-warning-dark text-xs">!</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Low Stock Alert</p>
                          <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">Premium Rice 50kg is below reorder point.</p>
                        <span className="text-[10px] text-text-subtle mt-1 block">5 mins ago</span>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-surface-2 cursor-pointer border-b border-border flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                        <span className="text-brand-600 text-xs">✓</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Payout Approved</p>
                        </div>
                        <p className="text-xs text-text-muted mt-1">PYT-4029 has been processed.</p>
                        <span className="text-[10px] text-text-subtle mt-1 block">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-border text-center">
                    <Link href="#" className="text-xs font-medium text-brand-600 hover:underline">View all notifications</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-border mx-1 hidden sm:block"></div>
            
            {/* User Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface-2 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                  {user ? getInitials(user.name) : 'JD'}
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-xs font-semibold leading-none">{user ? user.name : 'Jane Doe'}</span>
                  <span className="text-[10px] text-text-muted leading-none mt-1">{activeRole || 'Admin'}</span>
                </div>
              </button>
              {openDropdown === 'user' && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-md border border-border py-1 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium">{user ? user.name : 'Jane Doe'}</p>
                    <p className="text-xs text-text-muted">{user ? user.email : `jane.doe@${brand.domain}`}</p>
                  </div>
                  <Link href="#" className="block px-4 py-2 text-sm hover:bg-surface-2">My Profile</Link>
                  <Link href="#" className="block px-4 py-2 text-sm hover:bg-surface-2">Security</Link>
                  <div className="h-px bg-border my-1"></div>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-surface-2 text-error"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto relative px-4">
          {isRestrictedMerchantRoute ? <MerchantKycRestrictedView /> : children}
        </main>
      </div>
    </div>
  );
}
