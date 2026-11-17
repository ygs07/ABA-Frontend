'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getPopularBrands } from '@/features/shop/api';

export function PopularBrands() {
  const { data: brands = [], isLoading } = useQuery({ queryKey: ['popular-brands'], queryFn: getPopularBrands });
  if (!isLoading && brands.length === 0) return null;
  return <div className="mt-16 border-t border-border pt-12"><h3 className="mb-6 text-xl font-bold text-brand-950">Popular Brands</h3><div className="grid grid-cols-2 gap-4 md:grid-cols-6">{isLoading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-surface-2" />) : brands.map((brand) => <Link key={brand.id} href={`/shop?search=${encodeURIComponent(brand.name)}`} className="flex h-24 items-center justify-center rounded-xl border border-border bg-white px-3 text-center font-bold text-brand-950 shadow-sm transition-colors hover:border-brand-500">{brand.name}</Link>)}</div></div>;
}
