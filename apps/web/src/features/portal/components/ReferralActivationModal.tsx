'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useReferralActivationStore } from '../referralActivationStore';
import { ReferralKycStep } from './ReferralKycStep';
import { ReferralPaymentStep } from './ReferralPaymentStep';
import { ReferralSuccessStep } from './ReferralSuccessStep';
import { toast } from 'sonner';
import {
  initializeKycActivation,
  saveKycActivationSubmission,
  verifyKycActivation,
} from '../api';

interface ReferralActivationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kycApproved?: boolean;
}

export function ReferralActivationModal({ open, onOpenChange, kycApproved = false }: ReferralActivationModalProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const submitKyc = useReferralActivationStore((s) => s.submitKyc);
  const payActivationFee = useReferralActivationStore((s) => s.payActivationFee);

  React.useEffect(() => {
    if (open && kycApproved) setStep(1);
  }, [open, kycApproved]);

  const handleKycContinue = async (data: {
    idType: string;
    ninNumber: string;
    idDocumentName: string;
    proofOfAddressName: string;
    identityDocument: File;
    proofOfAddress: File;
  }) => {
    await saveKycActivationSubmission({
      idType: data.idType,
      identityNumber: data.ninNumber,
      identityDocument: data.identityDocument,
      proofOfAddress: data.proofOfAddress,
    });
    submitKyc(data);
    toast.success('KYC documents saved successfully.');
    setStep(1);
  };

  const handlePayFee = async () => {
    const checkout = await initializeKycActivation();
    const { default: PaystackPop } = await import('@paystack/inline-js');
    new PaystackPop().newTransaction({ key: checkout.publicKey, email: checkout.email, amount: checkout.amount, reference: checkout.reference,
      onSuccess: async ({ reference }) => { await verifyKycActivation(reference); await payActivationFee(); toast.success('Payment verified and ₦5,000 credited to Shopping Credits.'); setStep(2); },
      onCancel: () => toast.message('Activation payment cancelled.'),
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset step after closing
    setTimeout(() => setStep(0), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 bg-white rounded-2xl shadow-xl">
        {step === 0 && (
          <ReferralKycStep
            onContinue={handleKycContinue}
            onCancel={handleClose}
          />
        )}
        {step === 1 && (
          <ReferralPaymentStep
            onPay={handlePayFee}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <ReferralSuccessStep onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
