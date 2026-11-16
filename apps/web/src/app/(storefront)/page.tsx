'use client';

import React from 'react';
import { HeroBanner } from './_components/HeroBanner';
import { MeetBusinesses } from './_components/MeetBusinesses';
import { TrendingProducts } from './_components/TrendingProducts';
import { SpotlightSection } from '@/features/spotlight/components/SpotlightSection';
import { ProductSpotlight } from '@/features/promotions/components/ProductSpotlight';
import { CategoryMarquee } from './_components/CategoryMarquee';
import { MadeInAbaPromo } from './_components/MadeInAbaPromo';
import { TakeBusinessOnline } from './_components/TakeBusinessOnline';

export default function HomePage() {
  return (
    <React.Suspense fallback={<div className="h-96 flex items-center justify-center" aria-busy="true">Loading…</div>}>
      <Landing />
    </React.Suspense>
  );
}

function Landing() {
  return (
    <div className="flex mx-auto flex-col w-full font-sans animate-in fade-in duration-1000 bg-[#fdfaf1]">
      <HeroBanner />

      <ProductSpotlight />

      <TrendingProducts />

      <MeetBusinesses />

      <CategoryMarquee />

      <SpotlightSection />

      <MadeInAbaPromo />

      <TakeBusinessOnline />
    </div>
  );
}
