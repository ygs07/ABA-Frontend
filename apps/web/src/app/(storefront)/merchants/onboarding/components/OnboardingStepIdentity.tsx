'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MerchantOnboardingData } from '../types';
import { OnboardingFileUpload } from './OnboardingFileUpload';
import { User, Phone, Mail, ShieldCheck } from 'lucide-react';

interface OnboardingStepIdentityProps {
  form: UseFormReturn<MerchantOnboardingData>;
  idUploaded: boolean;
  onUploadId: (file: File) => void;
  onRemoveId: () => void;
}

export function OnboardingStepIdentity({
  form,
  idUploaded,
  onUploadId,
  onRemoveId,
}: OnboardingStepIdentityProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Owner / Authorised Representative Full Name <span className="text-error">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            {...register('ownerName')}
            placeholder="e.g. Emeka Christopher Nwosu"
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>
        {errors.ownerName && <p className="text-error text-xs mt-1">{errors.ownerName.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text mb-1.5">
            Phone Number <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('phone')}
              placeholder="e.g. +2348031234567"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>
          {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text mb-1.5">
            Business Email <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. emeka@abaleather.com"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text mb-1.5">
            Identity Document Type <span className="text-error">*</span>
          </label>
          <select
            {...register('idType')}
            className="w-full h-11 px-3 rounded-lg border border-border bg-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          >
            <option value="National Identity Number (NIN)">National Identity Number (NIN)</option>
            <option value="Voter's Card">Voter&apos;s Card</option>
            <option value="Driver's License">Driver&apos;s License</option>
            <option value="International Passport">International Passport</option>
          </select>
          {errors.idType && <p className="text-error text-xs mt-1">{errors.idType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text mb-1.5">
            ID / NIN Number (11 Digits) <span className="text-error">*</span>
          </label>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('ninNumber')}
              placeholder="e.g. 12345678901"
              maxLength={11}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>
          {errors.ninNumber && <p className="text-error text-xs mt-1">{errors.ninNumber.message}</p>}
        </div>
      </div>

      <OnboardingFileUpload
        title="Upload Identification Document"
        subtitle="Upload clear photo or PDF of government ID / NIN slip"
        fileName={form.watch('idDocumentName') || (idUploaded ? 'owner_id_card.jpg' : null)}
        isUploaded={idUploaded || Boolean(form.watch('idDocumentName'))}
        accept=".pdf,.jpg,.jpeg,.png"
        onFileSelect={(file) => {
          form.setValue('idDocumentName', file.name);
          onUploadId(file);
        }}
        onRemove={() => {
          form.setValue('idDocumentName', undefined);
          onRemoveId();
        }}
      />
    </div>
  );
}
