import React from 'react';
import { brand } from '@/config/brand';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">Privacy Policy</h1>
      <div className="mt-8 rounded-xl border border-dashed border-border bg-surface-1 p-8 min-h-[280px]">
        <p className="text-sm text-text-muted">
          Privacy Policy content for {brand.name} is pending and will be published once provided by the client.
        </p>
      </div>
    </div>
  );
}
