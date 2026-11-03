'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Star, AlertCircle } from 'lucide-react';

export interface ImageUploadFieldProps {
  label: string;
  description?: string;
  values?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number; // default 5MB
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  disabled?: boolean;
}

export function ImageUploadField({
  label,
  description,
  values = [],
  onChange,
  maxFiles = 1,
  maxSizeBytes = 5 * 1024 * 1024,
  aspectRatio = 'auto',
  disabled = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSingle = maxFiles === 1;
  const currentImages = values || [];
  const canAddMore = currentImages.length < maxFiles;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || disabled) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrorMessage('Only PNG and JPEG image files are allowed.');
        return;
      }
      if (file.size > maxSizeBytes) {
        setErrorMessage(`Image "${file.name}" exceeds ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    const availableSlots = maxFiles - currentImages.length;
    const filesToProcess = isSingle ? validFiles.slice(0, 1) : validFiles.slice(0, availableSlots);

    const newUrls: string[] = [];
    let processed = 0;

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newUrls.push(e.target.result as string);
        }
        processed++;
        if (processed === filesToProcess.length) {
          const updated = isSingle ? newUrls : [...currentImages, ...newUrls];
          onChange?.(updated);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = currentImages.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  const handleSetPrimary = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const target = currentImages[index];
    const rest = currentImages.filter((_, i) => i !== index);
    onChange?.([target, ...rest]);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'banner': return 'aspect-[3/1]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-text">{label}</label>
          {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
        <span className="text-xs text-text-muted">
          {currentImages.length} / {maxFiles} {isSingle ? 'image' : 'images'}
        </span>
      </div>

      {/* Upload Zone */}
      {canAddMore && (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-300'
              : 'border-border bg-surface-1 hover:border-brand-300 hover:bg-surface-2'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            multiple={!isSingle}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled}
          />
          <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-brand-600 hover:underline">Click to browse</span>
            <span className="text-text-muted"> or drag & drop</span>
          </div>
          <p className="text-[11px] text-text-muted">PNG or JPG up to 5MB each</p>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-error-50 text-error text-xs border border-error-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Previews Grid */}
      {currentImages.length > 0 && (
        <div className={`grid gap-3 ${isSingle ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
          {currentImages.map((url, idx) => (
            <div
              key={idx}
              className={`group relative rounded-lg border border-border overflow-hidden bg-surface-2 shadow-2xs ${getAspectClass()}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Uploaded preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!isSingle && idx !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => handleSetPrimary(idx, e)}
                    title="Set as primary cover"
                    className="p-1.5 rounded-md bg-white/90 text-text hover:bg-white transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => handleRemove(idx, e)}
                  title="Remove image"
                  className="p-1.5 rounded-md bg-error text-white hover:bg-error-dark transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Badges */}
              {idx === 0 && !isSingle && (
                <div className="absolute top-1.5 left-1.5 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
