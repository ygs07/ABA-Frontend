'use client';

import React from 'react';
import { ImageUploadField } from '@/components/patterns/ImageUploadField';
import { Sparkles, Info } from 'lucide-react';

interface ProductImagesSectionProps {
  images?: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export function ProductImagesSection({
  images = [],
  onChange,
  disabled = false,
}: ProductImagesSectionProps) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="bg-surface-2 px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg text-text">Product Images & Media</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Upload high quality photos for this product. The first image will be used as the primary storefront cover.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Up to 8 photos</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <ImageUploadField
          label="Gallery Images"
            description="Drag & drop or click to upload PNG or JPEG images. At least one is required; all images together must not exceed 12MB."
          values={images}
          onChange={onChange}
          maxFiles={8}
          aspectRatio="square"
          disabled={disabled}
        />

        <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-2/60 border border-border/80 text-xs text-text-muted">
          <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <p>
            Tip: Use square images (1:1 aspect ratio, at least 800x800px) with neutral or white backgrounds for the best storefront presentation. Click the star icon on any image to promote it to the primary cover.
          </p>
        </div>
      </div>
    </div>
  );
}
