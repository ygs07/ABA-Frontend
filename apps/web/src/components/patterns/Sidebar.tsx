'use client';

import React, { useState } from 'react';
import { brand } from '@/config/brand';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Network, 
  MonitorSmartphone, 
  Package, 
  Tags, 
  Store, 
  Truck, 
  ClipboardList, 
  Warehouse, 
  Factory, 
  CreditCard, 
  BadgePercent, 
  Banknote, 
  Landmark, 
  ShieldCheck, 
  Lock, 
  ScrollText, 
  Settings,
  ChevronRight,
  FileBarChart2
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store';
import { UserRole } from '@/features/auth/types';

// --- RBAC ---
// Map UserRole directly
type Role = UserRole | 'Customer'; // Customer added for completeness



interface NavItem {
  name: string;
  href?: string;
  icon?: React.ElementType;
  badge?: number | string;
  badgeVariant?: 'brand' | 'error';
  external?: boolean;
  allowedRoles: Role[];
  children?: NavItem[];
}

interface NavGroup {
  title: string;
  allowedRoles: Role[];
  items: NavItem[];
}

const NAV_STRUCTURE: NavGroup[] = [
  {
    title: 'Main',
    allowedRoles: ['Super Admin', 'Admin', 'Merchant', 'Staff', 'Auditor'],
    items: [
      { name: 'Dashboard', href: '/erp/dashboard', icon: LayoutDashboard, allowedRoles: ['Super Admin', 'Admin', 'Merchant', 'Staff', 'Auditor'] }
    ]
  },
  {
    title: 'Sales',
    allowedRoles: ['Super Admin', 'Admin', 'Merchant', 'Staff'],
    items: [
      { name: 'Orders', href: '/erp/orders', icon: ShoppingCart, badge: 12, badgeVariant: 'brand', allowedRoles: ['Super Admin', 'Admin', 'Merchant', 'Staff'] },
      { name: 'Customers', href: '/erp/customers', icon: Users, allowedRoles: ['Super Admin', 'Admin', 'Merchant', 'Staff'] },
      { 
        name: 'Referrals', 
        icon: Network, 
        allowedRoles: ['Super Admin', 'Admin', 'Merchant'],
        children: [
          { name: 'Overview', href: '/erp/referrals', allowedRoles: ['Super Admin', 'Admin', 'Merchant'] },
          { name: 'Records', href: '/erp/referrals/records', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Network', href: '/erp/referrals/network', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Codes & Links', href: '/erp/referrals/codes', allowedRoles: ['Super Admin', 'Admin', 'Merchant'] },
          { name: 'Suspicious Queue', href: '/erp/referrals/flags', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Settings', href: '/erp/referrals/settings', allowedRoles: ['Super Admin', 'Admin'] }
        ]
      },
      { name: 'Merchant POS', href: '/pos', icon: MonitorSmartphone, external: true, allowedRoles: ['Super Admin', 'Admin', 'Merchant'] }
    ]
  },
  {
    title: 'Catalog',
    allowedRoles: ['Super Admin', 'Admin', 'Merchant'],
    items: [
      { name: 'Products', href: '/erp/products', icon: Package, allowedRoles: ['Super Admin', 'Admin', 'Merchant'] },
      { name: 'Categories', href: '/erp/categories', icon: Tags, allowedRoles: ['Super Admin', 'Admin'] },
      { name: 'Merchants', href: '/erp/merchants', icon: Store, allowedRoles: ['Super Admin', 'Admin'] },
      { name: 'Suppliers', href: '/erp/suppliers', icon: Truck, allowedRoles: ['Super Admin', 'Admin'] }
    ]
  },
  {
    title: 'Supply Chain',
    allowedRoles: ['Super Admin', 'Admin', 'Staff'],
    items: [
      { 
        name: 'Procurement', 
        icon: ClipboardList, 
        badge: 3,
        badgeVariant: 'error',
        allowedRoles: ['Super Admin', 'Admin', 'Staff'],
        children: [
          { name: 'Purchase Requests', href: '/erp/procurement/requests', allowedRoles: ['Super Admin', 'Admin', 'Staff'] },
          { name: 'Purchase Orders', href: '/erp/procurement/orders', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Receiving', href: '/erp/procurement/receiving', allowedRoles: ['Super Admin', 'Admin', 'Staff'] },
        ]
      },
      { 
        name: 'Inventory', 
        icon: Warehouse, 
        badge: 8,
        badgeVariant: 'error',
        allowedRoles: ['Super Admin', 'Admin', 'Staff'],
        children: [
          { name: 'Stock Levels', href: '/erp/inventory', allowedRoles: ['Super Admin', 'Admin', 'Staff'] },
          { name: 'Movements', href: '/erp/inventory/movements', allowedRoles: ['Super Admin', 'Admin', 'Staff'] },
          { name: 'Transfers', href: '/erp/inventory/transfers/new', allowedRoles: ['Super Admin', 'Admin', 'Staff'] },
        ]
      },
      { 
        name: 'Production', 
        icon: Factory, 
        allowedRoles: ['Super Admin', 'Admin', 'Staff'],
        children: [
          { name: 'Production Orders', href: '/erp/production', allowedRoles: ['Super Admin', 'Admin', 'Staff'] },
          { name: 'BOMs', href: '/erp/production/boms', allowedRoles: ['Super Admin', 'Admin'] },
        ]
      }
    ]
  },
  {
    title: 'Money',
    allowedRoles: ['Super Admin', 'Admin'],
    items: [
      { 
        name: 'Payments', 
        icon: CreditCard, 
        allowedRoles: ['Super Admin', 'Admin'],
        children: [
          { name: 'Overview', href: '/erp/payments', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Refunds', href: '/erp/payments/refunds', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Failed Queue', href: '/erp/payments/failed', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Reconciliation', href: '/erp/payments/reconciliation', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Methods', href: '/erp/payments/methods', allowedRoles: ['Super Admin', 'Admin'] }
        ]
      },
      { 
        name: 'Commissions', 
        icon: BadgePercent, 
        badge: 5, 
        badgeVariant: 'brand', 
        allowedRoles: ['Super Admin', 'Admin', 'Merchant'],
        children: [
          { name: 'Overview', href: '/erp/commissions', allowedRoles: ['Super Admin', 'Admin', 'Merchant'] },
          { name: 'Records', href: '/erp/commissions/records', allowedRoles: ['Super Admin', 'Admin', 'Merchant'] },
          { name: 'Approvals', href: '/erp/commissions/approvals', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Plans & Rules', href: '/erp/commissions/rules', allowedRoles: ['Super Admin', 'Admin', 'Merchant'] },
          { name: 'Simulator', href: '/erp/commissions/simulator', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Reversals', href: '/erp/commissions/reversals', allowedRoles: ['Super Admin', 'Admin'] }
        ]
      },
      { 
        name: 'Payouts', 
        icon: Banknote, 
        badge: 14, 
        badgeVariant: 'error', 
        allowedRoles: ['Super Admin', 'Admin'],
        children: [
          { name: 'Overview', href: '/erp/payouts', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Batches', href: '/erp/payouts/batches', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Settings', href: '/erp/payouts/settings', allowedRoles: ['Super Admin', 'Admin'] }
        ]
      },
      { 
        name: 'Reports & Analytics', 
        href: '/erp/reports', 
        icon: FileBarChart2, 
        allowedRoles: ['Super Admin', 'Admin',] 
      },
      { 
        name: 'Finance', 
        icon: Landmark, 
        allowedRoles: ['Super Admin', 'Admin'],
        children: [
          { name: 'Overview', href: '/erp/finance', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Transactions', href: '/erp/finance/transactions', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Accounts Receivable', href: '/erp/finance/receivables', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Accounts Payable', href: '/erp/finance/payables', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Expenses', href: '/erp/finance/expenses', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'General Ledger', href: '/erp/finance/gl', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Chart of Accounts', href: '/erp/finance/chart-of-accounts', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Financial Periods', href: '/erp/finance/periods', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Reconciliation', href: '/erp/finance/reconciliation', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Reports', href: '/erp/finance/reports', allowedRoles: ['Super Admin', 'Admin'] },
          { name: 'Settings', href: '/erp/finance/settings', allowedRoles: ['Super Admin', 'Admin'] }
        ]
      }
    ]
  },
  {
    title: 'Insights',
    allowedRoles: ['Super Admin', 'Admin', 'Auditor'],
    items: [
      { name: 'Dashboards', href: '/erp/dashboards', icon: LayoutDashboard, allowedRoles: ['Super Admin', 'Admin', 'Auditor'] }
    ]
  },
  {
    title: 'Storefront',
    allowedRoles: ['Super Admin', 'Admin', 'Merchant'],
    items: [
      { name: 'Brand & Pages', href: '/erp/storefront/pages', icon: LayoutDashboard, allowedRoles: ['Super Admin', 'Admin'] },
      { name: 'Spotlight', href: '/erp/storefront/spotlight', icon: Tags, allowedRoles: ['Super Admin', 'Admin'] },
      { 
        name: 'Promotions', 
        icon: BadgePercent, 
        allowedRoles: ['Super Admin', 'Admin', 'Merchant'],
        children: [
          { name: 'All Promotions', href: '/erp/promotions', allowedRoles: ['Super Admin', 'Admin', 'Merchant'] },
          { name: 'Packages (Settings)', href: '/erp/settings/promotions', allowedRoles: ['Super Admin', 'Admin'] }
        ]
      },
      { name: 'Reviews', href: '/erp/storefront/reviews', icon: ScrollText, allowedRoles: ['Super Admin', 'Admin', 'Merchant'] },
      { name: 'Rewards', href: '/erp/storefront/rewards', icon: BadgePercent, allowedRoles: ['Super Admin', 'Admin'] }
    ]
  },
  {
    title: 'Administration',
    allowedRoles: ['Super Admin', 'Admin', 'Auditor'],
    items: [
      { name: 'Users', href: '/erp/settings/users', icon: ShieldCheck, allowedRoles: ['Super Admin', 'Admin'] },
      { name: 'KYC Reviews', href: '/erp/kyc', icon: ShieldCheck, allowedRoles: ['Super Admin', 'Admin'] },
      { name: 'Merchant Onboarding', href: '/erp/merchants/onboarding-applications', icon: Store, allowedRoles: ['Super Admin', 'Admin'] },
      { name: 'Roles & Permissions', href: '/erp/settings/roles', icon: Lock, allowedRoles: ['Super Admin'] },
      { name: 'Audit Logs', href: '/erp/settings/audit', icon: ScrollText, allowedRoles: ['Super Admin', 'Auditor'] },
      { name: 'Settings', href: '/erp/settings', icon: Settings, allowedRoles: ['Super Admin', 'Admin'] }
    ]
  },
  {
    title: 'Marketer Workspace',
    allowedRoles: ['Marketer'],
    items: [
      { name: 'Dashboard', href: '/erp/dashboard', icon: LayoutDashboard, allowedRoles: ['Marketer'] },
      { name: 'Referrals', href: '/erp/referrals', icon: Network, allowedRoles: ['Marketer'] },
      { name: 'Network', href: '/erp/referrals/network', icon: Users, allowedRoles: ['Marketer'] },
      { name: 'Codes & Links', href: '/erp/referrals/codes', icon: Tags, allowedRoles: ['Marketer'] },
    ]
  }
];


export function Sidebar() {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const user = useAuthStore(state => state.user);
  const authRole = useAuthStore(state => state.activeRole);
  
  const currentUserRoles = new Set<Role>([
    ...(user?.roles ?? []),
    ...(user?.userType ? [user.userType] : []),
    ...(authRole ? [authRole] : []),
  ]);
  const hasAccess = (allowedRoles: Role[]) => allowedRoles.some((role) => currentUserRoles.has(role));
  const displayRole = user?.userType ?? authRole ?? 'No role';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  const isGroupActive = (children?: NavItem[]) => {
    return children?.some(c => isActive(c.href)) || false;
  };

  React.useEffect(() => {
    // Wait a brief moment to ensure rendering is complete
    const timer = setTimeout(() => {
      const activeEl = document.getElementById('active-sidebar-item');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <aside className="w-64 shrink-0 text-sidebar-text flex-col hidden md:flex border-r border-sidebar-bg bg-brand-600">
      <div className="px-5 font-bold text-white h-16 flex items-center border-b border-white/10 shrink-0 shadow-sm z-10">
        {brand.shortName} ERP
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {NAV_STRUCTURE.filter(group => hasAccess(group.allowedRoles)).map((group) => (
          <div key={group.title} className="mb-6">
            {group.title !== 'Main' && (
              <div className="px-5 text-[11px] font-semibold tracking-wider uppercase text-sidebar-text/60 mb-2">
                {group.title}
              </div>
            )}
            
            <div className="space-y-1 px-3">
              {group.items.filter(item => hasAccess(item.allowedRoles)).map((item) => {
                
                const active = isActive(item.href) || isGroupActive(item.children);
                const isExpanded = expandedGroups[item.name] || isGroupActive(item.children);
                const Icon = item.icon!;

                if (item.children) {
                  return (
                    <div key={item.name} className="flex flex-col">
                      <button 
                        onClick={() => toggleGroup(item.name)}
                        className={`w-full flex items-center justify-between px-3 h-10 rounded-lg text-sm transition-colors ${
                          active ? 'bg-brand-600/20 text-white font-medium relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-brand-500 before:rounded-r-md' : 'text-sidebar-text hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${active ? 'text-brand-500' : 'opacity-70'}`} />
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {item.badge && (
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                item.badgeVariant === 'error' ? 'bg-error text-white' : 'bg-brand-600 text-white'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          <ChevronRight className={`w-4 h-4 opacity-50 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-1 ml-9 pl-3 border-l border-white/10 space-y-1">
                          {item.children.filter(c => hasAccess(c.allowedRoles)).map(child => {
                            const childActive = isActive(child.href);
                            return (
                              <Link 
                                key={child.name} 
                                href={child.href!}
                                id={childActive ? 'active-sidebar-item' : undefined}
                                className={`flex items-center h-8 px-3 rounded-md text-sm transition-colors ${
                                  childActive ? 'text-white bg-white/10 font-medium' : 'text-sidebar-text/80 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link 
                    key={item.name} 
                    href={item.href!}
                    target={item.external ? "_blank" : "_self"}
                    id={active ? 'active-sidebar-item' : undefined}
                    className={`flex items-center justify-between px-3 h-10 rounded-lg text-sm transition-colors group ${
                      active ? 'bg-white/10 text-white font-medium relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-brand-500 before:rounded-r-md' : 'text-sidebar-text hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'opacity-70 group-hover:text-brand-400 group-hover:opacity-100'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeVariant === 'error' ? 'bg-error text-white' : 'bg-brand-600 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/10 mt-auto shrink-0 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {user ? getInitials(user.name) : 'JD'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-white truncate">{user ? user.name : 'Jane Doe'}</span>
          <span className="text-xs text-sidebar-text/70 truncate">{displayRole} • {user ? user.status : 'Active'}</span>
        </div>
      </div>
    </aside>
  );
}
