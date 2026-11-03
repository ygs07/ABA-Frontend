'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MerchantOnboardingData } from '../types';
import { ShoppingBag, Box, Camera, CheckCircle2 } from 'lucide-react';

interface OnboardingStepProductsProps {
  form: UseFormReturn<MerchantOnboardingData>;
  photosCount: number;
  onPhotosSelected: (photos: File[]) => void;
  selectedPhotos: File[];
}

export function OnboardingStepProducts({
  form,
  photosCount,
  onPhotosSelected,
  selectedPhotos,
}: OnboardingStepProductsProps) {
  const { register, formState: { errors } } = form;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const nextPhotos = [...selectedPhotos, ...Array.from(files)].slice(0, 4);
      form.setValue('samplePhotosCount', nextPhotos.length, { shouldValidate: true });
      onPhotosSelected(nextPhotos);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Primary Products &amp; Specialty Description <span className="text-error">*</span>
        </label>
        <div className="relative">
          <ShoppingBag className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
          <textarea
            {...register('productDescription')}
            rows={2}
            placeholder="e.g. Handcrafted men's genuine leather oxfords, loafers, sandals, and belts with Goodyear welted construction."
            className="w-full p-3 pl-10 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
          />
        </div>
        {errors.productDescription && <p className="text-error text-xs mt-1">{errors.productDescription.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Estimated Monthly Supply Capacity <span className="text-error">*</span>
        </label>
        <div className="relative">
          <Box className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            {...register('capacity')}
            placeholder="e.g. 450 pairs / units per month"
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>
        {errors.capacity && <p className="text-error text-xs mt-1">{errors.capacity.message}</p>}
      </div>

      {/* BuyNaija Product Quality Standards Banner */}
      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 space-y-2">
        <div className="flex items-center gap-2 text-brand-900 font-bold text-sm">
          <Camera className="w-4 h-4 text-brand-700" />
          <span>BuyNaija Product Quality Standards</span>
        </div>
        <ul className="text-xs text-brand-800/90 space-y-1 list-disc pl-5 leading-relaxed">
          <li>High-resolution photos with clear natural or studio lighting</li>
          <li>Clean or neutral background that emphasizes genuine craftsmanship</li>
          <li>Accurate product representation without digital distortion or misleading filters</li>
        </ul>
      </div>

      {/* Sample Photos Upload Grid */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="sr-only"
          aria-label="Upload sample product photos"
        />
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-text">
            Sample Product Photos ({photosCount}/4 uploaded) <span className="text-error">*</span>
          </label>
          <span className="text-xs text-text-muted">Click any slot to browse image</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((index) => {
            const hasPhoto = index < photosCount;
            return (
              <button
                type="button"
                key={index}
                onClick={openPhotoPicker}
                className={`h-24 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  hasPhoto
                    ? 'border-brand-500 bg-brand-50/50 text-brand-700 hover:bg-brand-50'
                    : 'border-dashed border-border bg-surface-1 hover:border-brand-300 hover:bg-surface-2 text-text-muted'
                }`}
              >
                {hasPhoto ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-success-main" />
                    <span className="text-[11px] font-bold">Photo {index + 1}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span className="text-[11px]">Add Photo</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        {errors.samplePhotosCount && (
          <p className="text-error text-xs mt-1">{errors.samplePhotosCount.message}</p>
        )}
      </div>
    </div>
  );
}
