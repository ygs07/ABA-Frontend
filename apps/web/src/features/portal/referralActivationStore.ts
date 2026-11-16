import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ReferralActivationStatus = 'inactive' | 'pending' | 'active';

export interface ReferralActivationState {
  referralCode: string;
  status: ReferralActivationStatus;
  feeAmountNaira: number;
  feeAmountKobo: number;
  isKycCompleted: boolean;
  isFeePaid: boolean;
  ninNumber?: string;
  idType?: string;
  idDocumentName?: string;
  proofOfAddressName?: string;
  shoppingCreditsKobo: number;
  activatedAt?: string;

  // Actions
  submitKyc: (params: {
    ninNumber: string;
    idType: string;
    idDocumentName: string;
    proofOfAddressName: string;
  }) => void;
  payActivationFee: () => Promise<boolean>;
  resetToInactive: () => void;
}

export const useReferralActivationStore = create<ReferralActivationState>()(
  persist(
    (set, get) => ({
      referralCode: 'BN-EMEK-8821',
      status: 'inactive',
      feeAmountNaira: 5000,
      feeAmountKobo: 500000,
      isKycCompleted: false,
      isFeePaid: false,
      shoppingCreditsKobo: 0,

      submitKyc: ({ ninNumber, idType, idDocumentName, proofOfAddressName }) => {
        const { isFeePaid } = get();
        set({
          ninNumber,
          idType,
          idDocumentName,
          proofOfAddressName,
          isKycCompleted: true,
          status: isFeePaid ? 'active' : 'pending',
          activatedAt: isFeePaid ? new Date().toISOString() : undefined,
        });
      },

      payActivationFee: async () => {
        // Simulate payment transaction
        await new Promise((resolve) => setTimeout(resolve, 800));
        const { isKycCompleted, feeAmountKobo, shoppingCreditsKobo } = get();

        set({
          isFeePaid: true,
          shoppingCreditsKobo: shoppingCreditsKobo + feeAmountKobo,
          status: isKycCompleted ? 'active' : 'pending',
          activatedAt: isKycCompleted ? new Date().toISOString() : undefined,
        });
        return true;
      },

      resetToInactive: () => {
        set({
          referralCode: 'BN-EMEK-8821',
          status: 'inactive',
          feeAmountNaira: 5000,
          feeAmountKobo: 500000,
          isKycCompleted: false,
          isFeePaid: false,
          ninNumber: undefined,
          idType: undefined,
          idDocumentName: undefined,
          proofOfAddressName: undefined,
          shoppingCreditsKobo: 0,
          activatedAt: undefined,
        });
      },
    }),
    {
      name: 'naijahands_referral_activation',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
