'use client';

import React, { useId, useRef, useState } from 'react';
import { Upload, CheckCircle2, FileText, X } from 'lucide-react';

interface OnboardingFileUploadProps {
  title: string;
  subtitle: string;
  accept?: string;
  fileName?: string | null;
  isUploaded?: boolean;
  onFileSelect?: (file: File) => void;
  onUpload?: () => void;
  onRemove?: () => void;
}

export function OnboardingFileUpload({
  title,
  subtitle,
  accept = '.pdf,.jpg,.jpeg,.png',
  fileName,
  isUploaded = false,
  onFileSelect,
  onUpload,
  onRemove,
}: OnboardingFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [localFileName, setLocalFileName] = useState<string | null>(fileName || null);
  const [fileSizeText, setFileSizeText] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeName = fileName || localFileName;
  const hasUploaded = isUploaded || Boolean(activeName);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = (file: File) => {
    setLocalFileName(file.name);
    setFileSizeText(formatFileSize(file.size));
    if (onFileSelect) onFileSelect(file);
    if (onUpload) onUpload();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFilePicker();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalFileName(null);
    setFileSizeText(null);
    if (inputRef.current) inputRef.current.value = '';
    if (onRemove) onRemove();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openFilePicker}
      onKeyDown={handleCardKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
        isDragging
          ? 'border-brand-500 bg-brand-50/80 ring-2 ring-brand-400/40'
          : hasUploaded
          ? 'bg-success-50/70 border-success-main/40 hover:bg-success-50'
          : 'bg-surface-1 border-border hover:border-brand-300 hover:bg-surface-2'
      }`}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
        aria-label={title}
      />

      <div className="flex items-center gap-3 min-w-0 pr-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            hasUploaded
              ? 'bg-success-main text-white shadow-xs'
              : 'bg-surface-2 text-brand-700'
          }`}
        >
          {hasUploaded ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text truncate">{title}</p>
          {hasUploaded ? (
            <div className="flex items-center gap-1.5 text-xs text-success-dark font-medium mt-0.5">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-xs">{activeName}</span>
              {fileSizeText && <span className="text-text-muted shrink-0">({fileSizeText})</span>}
            </div>
          ) : (
            <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasUploaded && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 rounded-md text-text-muted hover:text-error hover:bg-red-50 transition-colors"
            title="Remove document"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openFilePicker();
          }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border shadow-2xs transition-colors ${
            hasUploaded
              ? 'bg-white text-text border-border hover:bg-surface-1'
              : 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700'
          }`}
        >
          {hasUploaded ? 'Change File' : 'Browse File'}
        </button>
      </div>
    </div>
  );
}
