'use client';

import Link from 'next/link';
import { ShoppingBag, Wallet, Users, ChevronRight, Package, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getCustomerOrders, getCustomerWalletBalance, getWalletTransactions, getReferralStats } from '@/features/portal/api';
import { AmountText } from '@/components/patterns/AmountText';
import { Alert } from '@/components/ui/alert';

export default function PortalDashboard() {
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['portal_orders'],
    queryFn: async () => (await getCustomerOrders()).data
  });

  const { data: walletData, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['portal_wallet'],
    queryFn: async () => (await getWalletTransactions()).data
  });

  const { data: walletBalance, isLoading: isLoadingWalletBalance } = useQuery({
    queryKey: ['portal_wallet_balance'],
    queryFn: getCustomerWalletBalance,
  });

  const { data: referralData, isLoading: isLoadingReferral } = useQuery({
    queryKey: ['portal_referrals'],
    queryFn: async () => (await getReferralStats()).data
  });

  if (isLoadingOrders || isLoadingWallet || isLoadingWalletBalance || isLoadingReferral) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!ordersData || !walletData || walletBalance === undefined || !referralData) {
    return (
      <Alert variant="destructive">
        Failed to load dashboard data. Please try again.
      </Alert>
    );
  }

  const pendingOrders = ordersData.filter(o => o.status === 'Pending' || o.status === 'Processing');
  const balance = walletBalance;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Welcome back, Jane!</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Wallet Card */}
        <div className="bg-brand-600 rounded-xl p-6 text-white shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              <p className="text-brand-100 text-sm font-medium mb-1">Wallet Balance</p>
              <h2 className="text-3xl font-bold"><AmountText amountInKobo={balance} /></h2>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex gap-2 relative z-10">
            <Button size="sm" className="bg-white text-brand-700 hover:bg-brand-50 rounded-full h-8 px-4 text-xs font-semibold">Fund</Button>
            <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full h-8 px-4 text-xs font-semibold">Withdraw</Button>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-text-muted text-sm font-medium mb-1">Pending Orders</p>
              <h2 className="text-2xl font-bold text-text">{pendingOrders.length} Active</h2>
            </div>
            <div className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-text-muted" />
            </div>
          </div>
          <Link href="/portal/orders" className="text-sm text-brand-600 font-medium hover:underline flex items-center mt-4">
            Track Orders <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Referrals Card */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-text-muted text-sm font-medium mb-1">Referral Earnings</p>
              <h2 className="text-2xl font-bold text-text"><AmountText amountInKobo={referralData.metrics.totalEarned} /></h2>
            </div>
            <div className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-text-muted" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <span className="text-sm font-medium text-success-dark">Network: {referralData.metrics.totalNetwork} members</span>
          </div>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-text">Recent Orders</h3>
            <Link href="/portal/orders" className="text-sm text-brand-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-border">
            {ordersData.slice(0, 3).map(order => (
              <div key={order.id} className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-2 rounded flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-text-muted" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">{order.id}</p>
                  <p className="text-xs text-text-muted">Placed {new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-text"><AmountText amountInKobo={order.total} /></p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${order.status === 'Processing' ? 'bg-warning-light text-warning-dark' :
                      order.status === 'Delivered' ? 'bg-success-bg text-success-dark' :
                        'bg-surface-2 text-text-muted'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {ordersData.length === 0 && (
              <div className="p-8 text-center text-sm text-text-muted">No recent orders found.</div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-text">Wallet Transactions</h3>
            <Link href="/portal/wallet" className="text-sm text-brand-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-border">
            {walletData.slice(0, 4).map(trx => {
              const isPositive = trx.amount > 0;
              return (
                <div key={trx.id} className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isPositive ? 'bg-success-bg' : 'bg-surface-2'}`}>
                    {isPositive ? <ArrowDownRight className="w-5 h-5 text-success-main" /> : <ArrowUpRight className="w-5 h-5 text-text-muted" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text text-sm">{trx.title}</p>
                    <p className="text-xs text-text-muted">{new Date(trx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${isPositive ? 'text-success-dark' : 'text-text'}`}>
                      {isPositive ? '+' : ''}<AmountText amountInKobo={trx.amount} />
                    </p>
                  </div>
                </div>
              );
            })}
            {walletData.length === 0 && (
              <div className="p-8 text-center text-sm text-text-muted">No recent transactions.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
