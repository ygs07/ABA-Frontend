'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MerchantOnboardingData } from '../types';
import { OnboardingFileUpload } from './OnboardingFileUpload';
import { CheckCircle2, Clock, Store } from 'lucide-react';

interface OnboardingStepBusinessProps {
  form: UseFormReturn<MerchantOnboardingData>;
  cacUploaded: boolean;
  onUploadCac: (file: File) => void;
  onRemoveCac: () => void;
}

export function OnboardingStepBusiness({
  form,
  cacUploaded,
  onUploadCac,
  onRemoveCac,
}: OnboardingStepBusinessProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const isProvisional = watch('isProvisional');
  const cacDocumentName = watch('cacDocumentName');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Registered Business / Brand Name <span className="text-error">*</span>
        </label>
        <div className="relative">
          <Store className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            {...register('businessName')}
            placeholder="e.g. Aba Leathercraft Artisans Ltd"
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>
        {errors.businessName && <p className="text-error text-xs mt-1">{errors.businessName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Primary Business Category / Industry <span className="text-error">*</span>
        </label>
        <select
          {...register('businessType')}
          className="w-full h-11 px-3 rounded-lg border border-border bg-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        >
          <option value="">Select industry category...</option>
          <option value="Footwear & Leather">Footwear &amp; Leather Crafts</option>
          <option value="Fashion & Apparel">Fashion &amp; Garment Manufacturing</option>
          <option value="Arts, Crafts & Woodwork">Arts, Crafts &amp; Woodwork</option>
          <option value="Food & Agro Products">Food &amp; Agro Products</option>
          <option value="Fabrics & Textiles">Fabrics &amp; Textiles</option>
          <option value="General Merchandise">General Merchandise</option>
        </select>
        {errors.businessType && <p className="text-error text-xs mt-1">{errors.businessType.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          CAC Registration Status <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('isProvisional', false)}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
              !isProvisional
                ? 'border-brand-600 bg-brand-50/50 shadow-2xs'
                : 'border-border bg-surface-1 hover:bg-surface-2'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              !isProvisional ? 'border-brand-600 bg-brand-600 text-white' : 'border-text-muted'
            }`}>
              {!isProvisional && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            <div>
              <p className="font-bold text-sm text-text">CAC Registered</p>
              <p className="text-xs text-text-muted mt-0.5">I have an RC or BN certificate from CAC.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setValue('isProvisional', true)}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
              isProvisional
                ? 'border-amber-600 bg-amber-50/60 shadow-2xs'
                : 'border-border bg-surface-1 hover:bg-surface-2'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              isProvisional ? 'border-amber-600 bg-amber-600 text-white' : 'border-text-muted'
            }`}>
              {isProvisional && <Clock className="w-3.5 h-3.5" />}
            </div>
            <div>
              <p className="font-bold text-sm text-amber-900">Provisional (60 Days)</p>
              <p className="text-xs text-amber-800/80 mt-0.5">Join temporarily while completing CAC registration.</p>
            </div>
          </button>
        </div>
      </div>

      {!isProvisional ? (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              CAC RC / Business Number (BN)
            </label>
            <input
              {...register('rcNumber')}
              placeholder="e.g. RC-1234567 or BN-987654"
              className="w-full h-11 px-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
            {errors.rcNumber && <p className="text-error text-xs mt-1">{errors.rcNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              Evidence of Business Registration
            </label>
            <OnboardingFileUpload
              title="CAC Certificate or Status Report"
              subtitle="Upload proof of business registration (.pdf, .jpg, .png)"
              fileName={cacDocumentName || (cacUploaded ? 'cac_certificate.pdf' : null)}
              isUploaded={cacUploaded || Boolean(cacDocumentName)}
              accept=".pdf,.jpg,.jpeg,.png"
              onFileSelect={(file) => {
                setValue('cacDocumentName', file.name, { shouldValidate: true });
                onUploadCac(file);
              }}
              onRemove={() => {
                setValue('cacDocumentName', undefined, { shouldValidate: true });
                onRemoveCac();
              }}
            />
            {errors.cacDocumentName && (
              <p className="text-error text-xs mt-1">{errors.cacDocumentName.message}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">60-Day Provisional Registration Grace Period</p>
            <p className="leading-relaxed">
              No CAC certificate yet? You can sell temporarily as a Provisional Merchant for 60 days. To maintain store privileges after 60 days, you must complete your registration with CAC and upload your document.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
