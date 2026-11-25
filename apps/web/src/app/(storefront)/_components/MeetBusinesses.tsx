'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getMeetBusinesses } from '@/features/shop/api';
import { storefrontConfig } from '@/config/storefront';
import { ItemCarousel } from '@/components/patterns/ItemCarousel';
import { MerchantCard } from '@/components/patterns/MerchantCard';
import { FadeIn } from '@/components/ui/MotionPrimitives';

/** "Meet Businesses" carousel on the shop landing (Doc 06 §6.1). */
export function MeetBusinesses() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['meet_businesses'],
    queryFn: async () => (await getMeetBusinesses()).data,
    retry: 1,
  });

  // No merchants: hide the section. Error: hide silently and retry in the background.
  React.useEffect(() => {
    if (!isError) return;
    const id = setTimeout(() => refetch(), 15000);
    return () => clearTimeout(id);
  }, [isError, refetch]);

  if (isError || (!isLoading && (!data || data.length === 0))) return null;

  return (
    <section aria-labelledby="meet-businesses-heading" className="bg-white border-y border-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 id="meet-businesses-heading" className="text-2xl md:text-3xl font-extrabold text-brand-900 tracking-tight">
              Meet Nigeria&apos;s Businesses
            </h2>
            <p className="mt-1 text-text-muted">Connect directly with the makers and sellers behind every product.</p>
          </div>
          <Link
            href="/merchants"
            className="shrink-0 self-start sm:self-auto rounded-full border border-brand-100 bg-brand-50 px-5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            View all businesses &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            aria-busy="true"
            aria-label="Loading businesses"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-white overflow-hidden p-4 space-y-3"
                aria-hidden="true"
              >
                <div className="h-28 w-full rounded-xl animate-shimmer" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full animate-shimmer shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-2/3 rounded animate-shimmer" />
                    <div className="h-3 w-1/2 rounded animate-shimmer" />
                  </div>
                </div>
                <div className="h-8 w-full rounded-full animate-shimmer mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <FadeIn>
            <ItemCarousel
              label="Featured businesses"
              autoplay={storefrontConfig.meetBusinesses.autoplay}
              autoplayIntervalMs={storefrontConfig.meetBusinesses.autoplayIntervalMs}
            >
              {data!.map(m => <MerchantCard key={m.id} merchant={m} />)}
            </ItemCarousel>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
