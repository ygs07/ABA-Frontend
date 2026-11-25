'use client';

import Link from 'next/link';
import { getShopCategories } from '@/features/shop/api';
import { useQuery } from '@tanstack/react-query';
import { FadeIn } from '@/components/ui/MotionPrimitives';

export function CategoryMarquee() {
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['shop_categories'],
    queryFn: async () => (await getShopCategories()).data
  });
  
  const categories = categoriesData || [];

  return (
    <section className="py-16 bg-linear-to-b from-[#fdfaf1] to-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-brand-900 mb-2">Discover what Nigeria has to offer</h2>
            <p className="text-text-muted">Shop products from businesses across Nigeria.</p>
          </div>
          <Link href="/shop" className="text-brand-600 font-semibold hover:underline hidden sm:block">
            View All Categories &rarr;
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden w-full min-h-[200px]">
        {/* Soft edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-20 bg-linear-to-r from-[#fdfaf1] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-20 bg-linear-to-l from-[#fdfaf1] to-transparent z-20" />

        {isLoading ? (
          <div
            className="flex gap-6 py-4 px-4 overflow-hidden"
            aria-busy="true"
            aria-label="Loading categories"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-36 sm:w-48 shrink-0 space-y-3" aria-hidden="true">
                <div className="aspect-square rounded-xl border border-border animate-shimmer" />
                <div className="h-4 w-24 mx-auto rounded animate-shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div className="flex gap-6 animate-marquee w-max py-4 px-4">
              {[...categories, ...categories].map((cat, i) => (
                <Link key={i} href={`/category/${cat.slug}`} className="group cursor-pointer w-36 sm:w-48 shrink-0">
                  <div className="aspect-square bg-white rounded-xl mb-3 flex items-center justify-center border border-border group-hover:border-brand-300 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
                    {cat.image ? (
                       <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                       <span className="text-text-muted/50 font-medium text-sm group-hover:scale-110 transition-transform duration-300 relative z-10">Image</span>
                    )}
                    <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/10 transition-colors duration-300 z-10"></div>
                  </div>
                  <h3 className="font-medium text-text text-center group-hover:text-brand-600 transition-colors">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
