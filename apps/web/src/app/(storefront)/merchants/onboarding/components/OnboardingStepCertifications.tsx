'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MerchantOnboardingData } from '../types';
import { OnboardingFileUpload } from './OnboardingFileUpload';
import { Award } from 'lucide-react';

interface OnboardingStepCertificationsProps {
  form: UseFormReturn<MerchantOnboardingData>;
  certUploaded: boolean;
  onUploadCert: (file: File) => void;
  onRemoveCert: () => void;
}

export function OnboardingStepCertifications({
  form,
  certUploaded,
  onUploadCert,
  onRemoveCert,
}: OnboardingStepCertificationsProps) {
  const { register, watch, formState: { errors } } = form;
  const certType = watch('certificationType');
  const hasCert = certType && certType !== 'None / Artisanal Guild';

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Industry / Product Certification
        </label>
        <select
          {...register('certificationType')}
          className="w-full h-11 px-3 rounded-lg border border-border bg-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        >
          <option value="None / Artisanal Guild">None / Artisanal Guild</option>
          <option value="NAFDAC (Regulated Goods)">NAFDAC (Regulated Goods)</option>
          <option value="SON (Standards Organisation of Nigeria)">SON (Standards Organisation of Nigeria)</option>
          <option value="NEPC (Export Promotion)">NEPC (Nigerian Export Promotion Council)</option>
        </select>
        {errors.certificationType && <p className="text-error text-xs mt-1">{errors.certificationType.message}</p>}
      </div>

      {hasCert && (
        <div className="space-y-4 p-4 rounded-xl border border-brand-200 bg-brand-50/40">
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              Certification / Registration Number
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...register('certificationNumber')}
                placeholder="e.g. NAFDAC-A1-998822 or SON-CAP-456"
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <OnboardingFileUpload
            title="Upload Certificate Document"
            subtitle="Attach valid regulatory certificate document (.pdf, .jpg, .png)"
            fileName={form.watch('certificationDocumentName') || (certUploaded ? 'certification_doc.pdf' : null)}
            isUploaded={certUploaded || Boolean(form.watch('certificationDocumentName'))}
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => {
              form.setValue('certificationDocumentName', file.name);
              onUploadCert(file);
            }}
            onRemove={() => {
              form.setValue('certificationDocumentName', undefined);
              onRemoveCert();
            }}
          />
        </div>
      )}

      <div className="pt-2 border-t border-border space-y-4">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Operational Verification &amp; SLA Commitment
        </h4>

        {/* Supply Capacity Confirmation */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-surface-1 cursor-pointer hover:bg-surface-2 transition-colors">
          <input
            type="checkbox"
            {...register('confirmSupplyCapacity')}
            className="w-4 h-4 rounded border-border text-brand-600 focus:ring-brand-500 mt-1 cursor-pointer"
          />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-text">Supply Capacity Confirmation</p>
            <p className="text-text-muted leading-relaxed">
              I confirm that my workshop/store has the operational capacity to fulfill listed products reliably and within promised timelines.
            </p>
            {errors.confirmSupplyCapacity && (
              <p className="text-error font-medium">{errors.confirmSupplyCapacity.message}</p>
            )}
          </div>
        </label>

        {/* Fulfillment SLA Agreement */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-surface-1 cursor-pointer hover:bg-surface-2 transition-colors">
          <input
            type="checkbox"
            {...register('agreeToFulfillmentSla')}
            className="w-4 h-4 rounded border-border text-brand-600 focus:ring-brand-500 mt-1 cursor-pointer"
          />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-text">Fulfillment &amp; Dispatch Standards Agreement</p>
            <p className="text-text-muted leading-relaxed">
              I agree to dispatch orders within 24–48 hours and strictly adhere to BuyNaija buyer protection, packaging, and delivery guidelines.
            </p>
            {errors.agreeToFulfillmentSla && (
              <p className="text-error font-medium">{errors.agreeToFulfillmentSla.message}</p>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
