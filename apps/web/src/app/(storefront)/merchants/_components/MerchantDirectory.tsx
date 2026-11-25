'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getDirectoryMerchants } from '@/features/shop/api';
import type { MerchantSort } from '@/features/merchants/types';
import { EmptyState } from '@/components/patterns/EmptyState';
import { ErrorState } from '@/components/patterns/ErrorState';
import { MerchantCard } from '@/components/patterns/MerchantCard';
import { FadeIn, StaggerGrid, StaggerItem } from '@/components/ui/MotionPrimitives';
import { Pagination } from '@/components/ui/pagination';
import { TakeBusinessOnline } from '../../_components/TakeBusinessOnline';

const SORTS: MerchantSort[] = ['recommended', 'newest'];

/** `/merchants` directory (Doc 06 §6.2). Every control is synced to the URL. */
export function MerchantDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const q = sp.get('q') ?? '';
  const sortParam = sp.get('sort') as MerchantSort | null;
  const sort: MerchantSort = sortParam && SORTS.includes(sortParam) ? sortParam : 'recommended';
  const page = Math.max(1, Number(sp.get('page')) || 1);

  const [term, setTerm] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    // URL changed externally (e.g. Clear filters): re-sync the input.
    setPrevQ(q);
    setTerm(q);
  }

  const setParams = (patch: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!keepPage) next.delete('page');
    if (next.toString() === sp.toString()) return;
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  // Debounced search.
  useEffect(() => {
    if (term.trim() === q.trim()) return;
    const id = setTimeout(() => setParams({ q: term.trim() || null }), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, q]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['merchant_directory', q, sort, page],
    queryFn: () => getDirectoryMerchants({ q, sort, page }),
    placeholderData: prev => prev,
    retry: false,
  });


  const hasActive = Boolean(q);
  const clearAll = () => router.push(pathname);

  const meta = data?.meta;

  return (
    <div className="bg-surface-1 min-h-screen mt-20">
      {/* Header */}
      <div className="bg-brand-600 text-white py-16">
        <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Discover Top Merchants</h1>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto mb-8">
            Shop directly from verified Naijahands merchants. Quality products, trusted sellers.
          </p>

          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="search"
              aria-label="Search businesses"
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="Search by store name"
              className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-white/30 focus:ring-2 focus:ring-brand-300 shadow-lg transition-all"
            />
          </div>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <p className="text-sm text-text-muted" aria-live="polite">
            {meta ? `${meta.total?.toLocaleString('en-NG')} ${meta.total === 1 ? 'business' : 'businesses'}` : 'Loading…'}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="merchant-sort" className="text-sm text-text-muted">Sort by</label>
            <select
              id="merchant-sort"
              value={sort}
              onChange={e => setParams({ sort: e.target.value === 'recommended' ? null : e.target.value })}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                aria-busy="true"
                aria-label="Loading businesses"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-white overflow-hidden p-4 space-y-3"
                    aria-hidden="true"
                  >
                    <div className="h-32 w-full rounded-xl animate-shimmer" />
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full animate-shimmer shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-2/3 rounded animate-shimmer" />
                        <div className="h-3 w-1/2 rounded animate-shimmer" />
                      </div>
                    </div>
                    <div className="h-3 w-full rounded animate-shimmer" />
                    <div className="h-9 w-full rounded-full animate-shimmer mt-2" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <ErrorState
                title="We couldn't load businesses"
                description={error instanceof Error ? error.message : 'Please try again.'}
                onRetry={() => refetch()}
              />
            ) : data && data.data.length === 0 ? (
              hasActive ? (
                <EmptyState
                  title="No businesses match your filters"
                  description="Try removing a filter or searching for something else."
                  actionLabel="Clear filters"
                  onAction={clearAll}
                />
              ) : (
                <EmptyState title="No businesses yet" description="Check back soon as new sellers join." />
              )
            ) : (
              <StaggerGrid
                key={`${q}-${sort}-${page}`}
                className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
              >
                {data?.data.map((m) => (
                  <StaggerItem key={m.id} className="hover:-translate-y-0.5 transition-transform duration-300">
                    <MerchantCard merchant={m} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            )}

            {meta && (
              <Pagination
                meta={meta}
                variant="numbered"
                onPageChange={(p) => setParams({ page: String(p) }, true)}
              />
            )}
          </div>
        </div>
      </div>

      <TakeBusinessOnline />
    </div>
  );
}
