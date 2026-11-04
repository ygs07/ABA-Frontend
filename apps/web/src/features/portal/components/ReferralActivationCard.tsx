'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Coins, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReferralActivationStore } from '../referralActivationStore';
import { ReferralActivationModal } from './ReferralActivationModal';
import { getOwnKycProfile, getShoppingCreditStatus } from '../api';

export function ReferralActivationCard({ referralCode: providedReferralCode }: { referralCode?: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isKycApproved, setIsKycApproved] = useState(false);
  const [isActivationPaid, setIsActivationPaid] = useState(false);
  const { status, referralCode: storedReferralCode } = useReferralActivationStore();
  const referralCode = providedReferralCode || storedReferralCode;
  const isActive = (isKycApproved && isActivationPaid) || status === 'active';

  useEffect(() => {
    void Promise.all([getOwnKycProfile(), getShoppingCreditStatus()])
      .then(([profile, credit]) => {
        setIsKycApproved(profile?.status === 3);
        setIsActivationPaid(credit.isActivated);
      })
      .catch(() => undefined);
  }, []);

  if (isActive) {
    return (
      <div className="rounded-xl border border-success-main/40 bg-success-50/60 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-success-main text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-success-dark text-base">Commission Earning Active</h4>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-success-main/15 text-success-dark">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              KYC verified • ₦5,000 shopping credit active in wallet • Earning commissions on all referrals
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs font-mono font-bold text-text bg-white px-3 py-1.5 rounded-md border border-success-main/30">
            {referralCode}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-amber-300/80 bg-linear-to-br from-amber-50/70 via-amber-50/30 to-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded bg-amber-600 text-white font-extrabold text-[10px] tracking-wider uppercase">
              Commission Inactive
            </span>
            <span className="text-xs text-amber-800 font-semibold">
              Code: <span className="font-mono font-bold">{referralCode}</span>
            </span>
          </div>
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            Requirement: {isKycApproved ? 'Pay ₦5,000 Activation Fee' : 'Complete KYC & ₦5,000 Fee'}
          </span>
        </div>

        <div className="py-4 space-y-3">
          <h3 className="text-xl font-extrabold text-text tracking-tight">
            Activate Your Referral Earning Account
          </h3>
          <p className="text-sm text-text-muted leading-relaxed max-w-2xl">
            {isKycApproved ? 'Your KYC is already approved. Complete the one-time ₦5,000 membership fee to activate commission earning.' : 'Every user receives a referral code upon registration, but earning commissions requires completing KYC verification and the one-time ₦5,000 membership fee.'}
          </p>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/90 border border-amber-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-text">100% Credited to Your Shopping Wallet!</p>
              <p className="text-text-muted leading-relaxed">
                Your ₦5,000 fee is credited immediately to your BuyNaija wallet. It cannot be withdrawn, but you can use it anytime to purchase any products across BuyNaija.
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic">
            * Note: Users who only wish to shop can do so freely without activating their referral codes.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            onClick={() => setModalOpen(true)}
            className="font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center justify-center gap-2 rounded-xl h-11 px-6"
          >
            <Sparkles className="w-4 h-4" />
            Activate Earning (KYC & ₦5,000 Fee)
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ReferralActivationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        kycApproved={isKycApproved}
      />
    </>
  );
}
