'use client';

import React, { useEffect } from 'react';
import { useStorefrontSpotlight } from '../queries';
import { SpotlightCard } from './SpotlightCard';
import { trackSpotlightEvent } from '../api';
import { StaggerGrid, StaggerItem } from '@/components/ui/MotionPrimitives';

export function SpotlightSection() {
  const { data: merchants, isLoading, error } = useStorefrontSpotlight();

  useEffect(() => {
    if (merchants && merchants.length > 0) {
      // Mock impression tracking
      merchants.forEach(m => trackSpotlightEvent({ event: 'impression', merchantId: m.id, timestamp: new Date().toISOString() }));
    }
  }, [merchants]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-busy="true" aria-label="Loading merchant spotlight">
        <div className="h-8 w-56 rounded animate-shimmer mb-3" />
        <div className="h-4 w-96 max-w-full rounded animate-shimmer mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-white overflow-hidden p-4 space-y-3" aria-hidden="true">
              <div className="h-32 w-full rounded-lg animate-shimmer" />
              <div className="h-4 w-2/3 rounded animate-shimmer" />
              <div className="h-3 w-full rounded animate-shimmer" />
              <div className="h-3 w-4/5 rounded animate-shimmer" />
              <div className="h-9 w-full rounded-lg animate-shimmer mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !merchants || merchants.length === 0) {
    return null; // Hidden when empty or on error
  }

  return (
    <section className="bg-brand-50/30 border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-text mb-3">Merchant Spotlight</h2>
            <p className="text-text-muted max-w-2xl text-lg">
              Discover top-rated sellers providing exceptional service and quality products.
            </p>
          </div>
        </div>

        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
          {merchants.map((merchant) => (
            <StaggerItem key={merchant.id} className="hover:-translate-y-0.5 transition-transform duration-300">
              <SpotlightCard
                merchant={merchant}
                onHover={() => {
                  trackSpotlightEvent({ event: 'open', merchantId: merchant.id, timestamp: new Date().toISOString() });
                }}
              />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
