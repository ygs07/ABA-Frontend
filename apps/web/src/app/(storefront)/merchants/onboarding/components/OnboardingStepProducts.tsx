'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MerchantOnboardingData } from '../types';
import { ShoppingBag, Box, Camera, Trash2 } from 'lucide-react';

const MAX_SAMPLE_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_SAMPLE_PHOTOS = 4;

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
  const [replaceAtIndex, setReplaceAtIndex] = React.useState<number | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const previews = React.useMemo(
    () => selectedPhotos.map((photo) => URL.createObjectURL(photo)),
    [selectedPhotos],
  );

  React.useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview)),
    [previews],
  );

  const openPhotoPicker = (index: number) => {
    setReplaceAtIndex(index < selectedPhotos.length ? index : null);
    fileInputRef.current?.click();
  };

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    const invalidFile = files.find(
      (file) =>
        file.size > MAX_SAMPLE_PHOTO_SIZE ||
        !['image/jpeg', 'image/png'].includes(file.type),
    );
    if (invalidFile) {
      setUploadError(
        invalidFile.size > MAX_SAMPLE_PHOTO_SIZE
          ? `${invalidFile.name} exceeds the 5 MB size limit.`
          : `${invalidFile.name} must be a JPEG or PNG image.`,
      );
      return;
    }

    const nextPhotos = [...selectedPhotos];
    if (replaceAtIndex !== null) {
      files.slice(0, MAX_SAMPLE_PHOTOS - replaceAtIndex).forEach((file, offset) => {
        nextPhotos[replaceAtIndex + offset] = file;
      });
    } else {
      nextPhotos.push(...files.slice(0, MAX_SAMPLE_PHOTOS - nextPhotos.length));
    }
    setUploadError(null);
    form.setValue('samplePhotosCount', nextPhotos.length, { shouldValidate: true });
    onPhotosSelected(nextPhotos);
  };

  const removePhoto = (index: number) => {
    const nextPhotos = selectedPhotos.filter((_, photoIndex) => photoIndex !== index);
    setUploadError(null);
    form.setValue('samplePhotosCount', nextPhotos.length, { shouldValidate: true });
    onPhotosSelected(nextPhotos);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-text">
          Primary Products &amp; Specialty Description <span className="text-error">*</span>
        </label>
        <div className="relative">
          <ShoppingBag className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted" />
          <textarea {...register('productDescription')} rows={2} placeholder="e.g. Handcrafted men's genuine leather oxfords, loafers, sandals, and belts with Goodyear welted construction." className="w-full resize-none rounded-lg border border-border p-3 pl-10 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
        </div>
        {errors.productDescription && <p className="mt-1 text-xs text-error">{errors.productDescription.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-text">
          Estimated Monthly Supply Capacity <span className="text-error">*</span>
        </label>
        <div className="relative">
          <Box className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input {...register('capacity')} placeholder="e.g. 450 pairs / units per month" className="h-11 w-full rounded-lg border border-border pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
        </div>
        {errors.capacity && <p className="mt-1 text-xs text-error">{errors.capacity.message}</p>}
      </div>

      <div className="space-y-2 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-brand-900"><Camera className="h-4 w-4 text-brand-700" />BuyNaija Product Quality Standards</div>
        <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-brand-800/90">
          <li>High-resolution photos with clear natural or studio lighting</li>
          <li>Clean or neutral background that emphasizes genuine craftsmanship</li>
          <li>Accurate product representation without digital distortion or misleading filters</li>
        </ul>
      </div>

      <div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" multiple onChange={handleFiles} className="sr-only" aria-label="Upload sample product photos" />
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="text-sm font-semibold text-text">Sample Product Photos ({photosCount}/{MAX_SAMPLE_PHOTOS} uploaded) <span className="text-error">*</span></label>
          <span className="text-right text-xs text-text-muted">JPEG or PNG · max 5 MB each</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: MAX_SAMPLE_PHOTOS }, (_, index) => {
            const photo = selectedPhotos[index];
            return photo ? (
              <div key={`${photo.name}-${index}`} className="group relative h-28 overflow-hidden rounded-xl border border-brand-300 bg-surface-1">
                <img src={previews[index]} alt={`Sample product ${index + 1}`} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 p-1.5">
                  <button type="button" onClick={() => openPhotoPicker(index)} className="rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-text hover:bg-white">Replace</button>
                  <button type="button" onClick={() => removePhoto(index)} aria-label={`Remove ${photo.name}`} className="rounded p-1 text-white hover:bg-white/20"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ) : (
              <button type="button" key={index} onClick={() => openPhotoPicker(index)} className="flex h-28 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-surface-1 text-text-muted transition-all hover:border-brand-300 hover:bg-surface-2">
                <Camera className="h-5 w-5" />
                <span className="text-[11px]">Add Photo</span>
              </button>
            );
          })}
        </div>
        {uploadError && <p role="alert" className="mt-2 text-xs text-error">{uploadError}</p>}
        {errors.samplePhotosCount && <p className="mt-1 text-xs text-error">{errors.samplePhotosCount.message}</p>}
      </div>
    </div>
  );
}
