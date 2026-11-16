'use client';

import React, { useState } from 'react';
import { Coins, Loader2, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferralPaymentStepProps {
  onPay: () => Promise<void>;
  onBack: () => void;
}

export function ReferralPaymentStep({ onPay, onBack }: ReferralPaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      await onPay();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-warning-light flex items-center justify-center text-warning-dark">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text">Step 2 of 2: Activation Fee</h3>
          <p className="text-xs text-text-muted">
            Membership registration payment to unlock commissions.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-warning-main/30 bg-warning-50/50 p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-text">Registration Fee:</span>
          <span className="text-2xl font-black text-brand-700">₦5,000</span>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-warning-main/20">
          <ShoppingBag className="w-5 h-5 text-warning-dark shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-text">100% Credited to Your Shopping Wallet!</p>
            <p className="text-text-muted leading-relaxed">
              Your ₦5,000 fee is credited immediately to your Naijahands wallet. It cannot be withdrawn, but you can use it anytime to purchase any products across Naijahands.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
          <ShieldCheck className="w-4 h-4 text-success-main shrink-0" />
          <span>Secure checkout • Instant activation upon payment completion</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to KYC
        </Button>
        <Button
          type="button"
          onClick={handlePayment}
          disabled={isProcessing}
          className="px-6 font-bold"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Payment...
            </>
          ) : (
            'Pay ₦5,000 & Activate'
          )}
        </Button>
      </div>
    </div>
  );
}
