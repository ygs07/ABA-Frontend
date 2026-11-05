'use client';

import React from 'react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferralSuccessStepProps {
  onClose: () => void;
}

export function ReferralSuccessStep({ onClose }: ReferralSuccessStepProps) {
  return (
    <div className="text-center py-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-success-50 text-success-main flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-text">Activation Payment Received</h3>
        <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
          Your KYC application has been submitted for review. Commission earning starts once an administrator approves it.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
        <ShoppingBag className="w-4 h-4" />
        <span>₦5,000 Shopping Credit added to your Wallet</span>
      </div>

      <div className="pt-4 border-t border-border">
        <Button onClick={onClose} className="w-full font-bold">
          Continue
        </Button>
      </div>
    </div>
  );
}
