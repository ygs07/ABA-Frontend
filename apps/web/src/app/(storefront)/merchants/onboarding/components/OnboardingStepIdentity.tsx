'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { IDENTITY_DOCUMENT_NUMBER_DETAILS, IDENTITY_DOCUMENT_TYPES, MerchantOnboardingData } from '../types';
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
  const { register, watch, formState: { errors } } = form;
  const identityDocumentType = watch('idType');
  const identityNumberDetails = IDENTITY_DOCUMENT_NUMBER_DETAILS[identityDocumentType];

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
            Contact Phone Number <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              autoComplete="tel"
              {...register('contactPhoneNumber')}
              placeholder="e.g. +2348031234567"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>
          {errors.contactPhoneNumber && <p className="text-error text-xs mt-1">{errors.contactPhoneNumber.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text mb-1.5">
            WhatsApp Phone Number <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              autoComplete="tel"
              {...register('whatsappPhoneNumber')}
              placeholder="e.g. +2348031234567"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>
          {errors.whatsappPhoneNumber && <p className="text-error text-xs mt-1">{errors.whatsappPhoneNumber.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Business Email <span className="text-error">*</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            placeholder="e.g. emeka@abaleather.com"
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>
        {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
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
            {IDENTITY_DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>{IDENTITY_DOCUMENT_NUMBER_DETAILS[type].label}</option>
            ))}
          </select>
          {errors.idType && <p className="text-error text-xs mt-1">{errors.idType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text mb-1.5">
            {identityNumberDetails.inputLabel} <span className="text-error">*</span>
          </label>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('idNumber')}
              placeholder={identityNumberDetails.placeholder}
              maxLength={identityNumberDetails.maxLength}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>
          <p className="text-text-muted text-xs mt-1">{identityNumberDetails.description}</p>
          {errors.idNumber && <p className="text-error text-xs mt-1">{errors.idNumber.message}</p>}
        </div>
      </div>

      <OnboardingFileUpload
        title="Upload Identification Document"
        subtitle="Upload clear photo or PDF of government ID / NIN slip"
        fileName={form.watch('idDocumentName') || (idUploaded ? 'owner_id_card.jpg' : null)}
        isUploaded={idUploaded || Boolean(form.watch('idDocumentName'))}
        accept=".pdf,.jpg,.jpeg,.png"
        onFileSelect={(file) => {
          form.setValue('idDocumentName', file.name, { shouldValidate: true });
          onUploadId(file);
        }}
        onRemove={() => {
          form.setValue('idDocumentName', '', { shouldValidate: true });
          onRemoveId();
        }}
      />
      {errors.idDocumentName && (
        <p className="text-error text-xs -mt-3">{errors.idDocumentName.message}</p>
      )}
    </div>
  );
}
