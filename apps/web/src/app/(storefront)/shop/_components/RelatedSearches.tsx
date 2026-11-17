'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getRelatedSearches } from '@/features/shop/api';

export function RelatedSearches() {
  const { data: searches = [], isLoading } = useQuery({ queryKey: ['related-searches'], queryFn: getRelatedSearches });
  if (!isLoading && searches.length === 0) return null;
  return <div className="mt-16 border-t border-border pt-12"><h3 className="mb-6 text-xl font-bold text-brand-950">Related searches</h3><div className="flex flex-wrap gap-3">{isLoading ? Array.from({ length: 8 }).map((_, index) => <span key={index} className="h-9 w-36 animate-pulse rounded-full bg-surface-2" />) : searches.map((search) => <Link key={`${search.type}-${search.id}`} href={`/shop?search=${encodeURIComponent(search.query)}`} className="rounded-full border border-transparent bg-gray-100/80 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-200">{search.label}</Link>)}</div></div>;
}
