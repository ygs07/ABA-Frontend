'use client';

import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MerchantOnboardingData } from '../types';
import { MapPin, Building, CreditCard } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface OnboardingStepLocationProps {
  form: UseFormReturn<MerchantOnboardingData>;
}

type PaystackBank = { name: string; code: string; active: boolean };
type ResolvedAccount = { accountName: string; accountNumber: string; bankCode: string };

export function OnboardingStepLocation({ form }: OnboardingStepLocationProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const [banks, setBanks] = useState<PaystackBank[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [accountResolutionError, setAccountResolutionError] = useState<string | null>(null);
  const accountNumber = watch('accountNumber');

  useEffect(() => {
    let isMounted = true;
    const loadBanks = async () => {
      try {
        const bankList = await fetchApi<PaystackBank[]>('/api/v1/merchant-onboarding/applications/banks');
        if (isMounted) setBanks(bankList);
      } catch {
        if (isMounted) setAccountResolutionError('Unable to load supported banks. Please refresh and try again.');
      } finally {
        if (isMounted) setIsLoadingBanks(false);
      }
    };
    void loadBanks();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    setAccountName('');
    setAccountResolutionError(null);
    if (!bankCode || !/^\d{10}$/.test(accountNumber ?? '')) return;

    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      setIsResolvingAccount(true);
      void fetchApi<ResolvedAccount>(
        `/api/v1/merchant-onboarding/applications/resolve-bank-account?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(bankCode)}`,
      )
        .then((resolvedAccount) => {
          if (isMounted) setAccountName(resolvedAccount.accountName);
        })
        .catch(() => {
          if (isMounted) setAccountResolutionError('We could not verify this account. Check the bank and account number.');
        })
        .finally(() => {
          if (isMounted) setIsResolvingAccount(false);
        });
    }, 450);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [accountNumber, bankCode]);

  const selectBank = (selectedBankCode: string) => {
    setBankCode(selectedBankCode);
    const selectedBank = banks.find((bank) => bank.code === selectedBankCode);
    setValue('bankName', selectedBank?.name ?? '', { shouldValidate: true });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Physical Workshop / Store Address <span className="text-error">*</span>
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
          <textarea
            {...register('address')}
            rows={2}
            placeholder="e.g. 14 Faulks Road, Block C Suite 4"
            className="w-full p-3 pl-10 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
          />
        </div>
        {errors.address && <p className="text-error text-xs mt-1">{errors.address.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Market Hub / Industrial Cluster <span className="text-error">*</span>
        </label>
        <select
          {...register('marketCluster')}
          className="w-full h-11 px-3 rounded-lg border border-border bg-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        >
          <option value="Ariaria International Market">Ariaria International Market</option>
          <option value="Faulks Road Cluster">Faulks Road Cluster</option>
          <option value="Eziukwu / Cemetery Market">Eziukwu / Cemetery Market</option>
          <option value="Shopping Complex / Mall">Shopping Complex / Mall</option>
          <option value="Independent Workshop / Store">Independent Workshop / Store</option>
        </select>
        {errors.marketCluster && <p className="text-error text-xs mt-1">{errors.marketCluster.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text mb-1.5">
            City / Town <span className="text-error">*</span>
          </label>
          <input
            {...register('city')}
            placeholder="e.g. Aba"
            className="w-full h-11 px-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
          {errors.city && <p className="text-error text-xs mt-1">{errors.city.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text mb-1.5">
            State <span className="text-error">*</span>
          </label>
          <select
            {...register('state')}
            className="w-full h-11 px-3 rounded-lg border border-border bg-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          >
            <option value="Abia">Abia State</option>
            <option value="Lagos">Lagos State</option>
            <option value="Enugu">Enugu State</option>
            <option value="Anambra">Anambra State</option>
            <option value="Imo">Imo State</option>
            <option value="Rivers">Rivers State</option>
            <option value="Abuja (FCT)">Abuja (FCT)</option>
          </select>
          {errors.state && <p className="text-error text-xs mt-1">{errors.state.message}</p>}
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Settlement Banking Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              Settlement Bank Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={bankCode}
                onChange={(event) => selectBank(event.target.value)}
                disabled={isLoadingBanks}
                className="w-full h-11 appearance-none bg-white pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">{isLoadingBanks ? 'Loading banks…' : 'Select settlement bank'}</option>
                {banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
              </select>
            </div>
            {errors.bankName && <p className="text-error text-xs mt-1">{errors.bankName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              10-Digit NUBAN Account Number <span className="text-error">*</span>
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...register('accountNumber')}
                maxLength={10}
                placeholder="e.g. 0123456789"
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
            {errors.accountNumber && <p className="text-error text-xs mt-1">{errors.accountNumber.message}</p>}
          </div>
        </div>
        <input type="hidden" {...register('bankName')} />
        {isResolvingAccount && <p className="mt-2 text-xs text-text-muted">Verifying account details…</p>}
        {accountName && <p className="mt-2 rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success">Account verified: {accountName}</p>}
        {accountResolutionError && <p className="mt-2 text-xs text-error">{accountResolutionError}</p>}
      </div>
    </div>
  );
}
