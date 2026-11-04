'use client';

import { useState } from 'react';
import { Users, Copy, Share2, Check, DollarSign, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getReferralStats } from '@/features/portal/api';
import { AmountText } from '@/components/patterns/AmountText';
import { Alert } from '@/components/ui/alert';
import { ReferralActivationCard } from '@/features/portal/components/ReferralActivationCard';

export default function PortalReferralsPage() {
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading, error } = useQuery({
    queryKey: ['portal_referrals_page'],
    queryFn: async () => {
      const res = await getReferralStats();
      return res.data;
    },
  });

  const referralCode = referralData?.referralCode ?? '';
  const referralLink = referralCode
    ? `${typeof window === 'undefined' ? '' : window.location.origin}/auth/register?ref=${encodeURIComponent(referralCode)}`
    : '';
  const copyToClipboard = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !referralData) {
    return (
      <Alert variant="destructive">
        Failed to load referral data. Please try again.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Referral Network</h1>
        <div className="flex items-center gap-3">
          <Button onClick={copyToClipboard} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share Link
          </Button>
        </div>
      </div>

      {/* Referral Activation Notice & KYC/Fee Payment Card */}
      <ReferralActivationCard referralCode={referralCode} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-text-muted font-medium text-sm">Total Network</p>
          </div>
          <h2 className="text-3xl font-bold text-text">{referralData.metrics.totalNetwork}</h2>
          <p className="text-xs text-success-main font-medium mt-1">+3 this month</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-success-main" />
            </div>
            <p className="text-text-muted font-medium text-sm">Active Buyers</p>
          </div>
          <h2 className="text-3xl font-bold text-text">{referralData.metrics.activeBuyers}</h2>
          <p className="text-xs text-text-muted mt-1">75% conversion rate</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-warning-light flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-warning-dark" />
            </div>
            <p className="text-text-muted font-medium text-sm">Total Earned</p>
          </div>
          <h2 className="text-3xl font-bold text-text">
            <AmountText amountInKobo={referralData.metrics.totalEarned} />
          </h2>
          <p className="text-xs text-text-muted mt-1">Lifetime commissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Share Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-border shadow-xs p-6 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-brand-600" />
            </div>
            <h3 className="font-bold text-text text-lg mb-2">Invite & Earn</h3>
            <p className="text-sm text-text-muted mb-6">
              Share your referral link with friends. When they sign up and make a purchase, you earn a percentage as commission in your wallet!
            </p>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                  Your Referral Code
                </label>
                <div className="bg-surface-2 border border-border rounded-md px-4 py-3 font-mono font-bold text-center text-text text-lg tracking-widest">
                  {referralCode}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                  Share Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 min-w-0 bg-surface-1 border border-border rounded-l-md px-3 text-sm text-text-muted outline-none"
                  />
                  <Button onClick={copyToClipboard} className="rounded-l-none">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border shadow-xs">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-text">Your Network</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-1 text-text-muted uppercase text-xs tracking-wider border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Earned from User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {referralData.stats.map((user, idx) => (
                    <tr key={idx} className="hover:bg-surface-1/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                            {user.referredUserName.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span className="font-medium text-text">{user.referredUserName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-muted">{new Date(user.joinedDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {user.status === 'Active' ? (
                          <span className="px-2 py-1 rounded bg-success-50 text-success-dark text-xs font-semibold">Active</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-surface-2 text-text-muted text-xs font-semibold">Pending Purchase</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-text">
                        <AmountText amountInKobo={user.earnings} />
                      </td>
                    </tr>
                  ))}
                  {referralData.stats.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                        No referrals found. Start sharing your link!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
