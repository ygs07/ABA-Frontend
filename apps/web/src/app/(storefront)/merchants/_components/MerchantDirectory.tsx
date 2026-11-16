'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { getDirectoryMerchants } from '@/features/shop/api';
import type { MerchantSort } from '@/features/merchants/types';
import { EmptyState } from '@/components/patterns/EmptyState';
import { ErrorState } from '@/components/patterns/ErrorState';
import { MerchantCard } from '@/components/patterns/MerchantCard';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MerchantFilters, SORT_OPTIONS } from './MerchantFilters';
import { Pagination } from '@/components/ui/pagination';
import { TakeBusinessOnline } from '../../_components/TakeBusinessOnline';

const SORTS = SORT_OPTIONS.map(o => o.value);

/** `/merchants` directory (Doc 06 §6.2). Every control is synced to the URL. */
export function MerchantDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const q = sp.get('q') ?? '';
  const category = sp.get('category') ?? '';
  const state = sp.get('state') ?? '';
  const minRating = sp.get('rating') ?? '';
  const verified = sp.get('verified') === '1';
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
    queryKey: ['merchant_directory', q, category, state, minRating, verified, sort, page],
    queryFn: () => getDirectoryMerchants({ q, category, state, minRating: Number(minRating) || undefined, verifiedOnly: verified, sort, page, hasProducts: true }),
    placeholderData: prev => prev,
    retry: false,
  });


  const hasActive = Boolean(q || category || state || minRating || verified);
  const clearAll = () => router.push(pathname);
  const filters = (
    <MerchantFilters
      values={{ state, minRating, verified }}
      states={data?.facets.states ?? []}
      hasActive={hasActive}
      onClear={clearAll}
      onChange={p => setParams({
        ...(p.state !== undefined && { state: p.state || null }),
        ...(p.minRating !== undefined && { rating: p.minRating || null }),
        ...(p.verified !== undefined && { verified: p.verified ? '1' : null }),
      })}
    />
  );

  const meta = data?.meta;

  return (
    <div className="bg-surface-1 min-h-screen mt-20">
      {/* Header */}
      <div className="bg-brand-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Discover Top Merchants</h1>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto mb-8">
            Shop directly from verified vendors on the ABA Marketplace. Quality products, trusted sellers.
          </p>

          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="search"
              aria-label="Search businesses"
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="Search by name, city or state"
              className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-white/30 focus:ring-2 focus:ring-brand-300 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <p className="text-sm text-text-muted" aria-live="polite">
            {meta ? `${meta.total?.toLocaleString('en-NG')} ${meta.total === 1 ? 'business' : 'businesses'}` : 'Loading…'}
          </p>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" className="lg:hidden gap-2"><SlidersHorizontal className="w-4 h-4" />Filters</Button>} />
              <SheetContent side="left" className="w-[300px] sm:w-[340px] overflow-y-auto">
                <SheetHeader className="mb-4"><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="space-y-6">
                  {filters}
                </div>
              </SheetContent>
            </Sheet>
            <label htmlFor="merchant-sort" className="text-sm text-text-muted">Sort by</label>
            <select
              id="merchant-sort"
              value={sort}
              onChange={e => setParams({ sort: e.target.value === 'recommended' ? null : e.target.value })}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-[240px] shrink-0 space-y-6 sticky top-4">
            {filters}
          </aside>

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
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
              <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                {data?.data.map(m => <MerchantCard key={m.id} merchant={m} />)}
              </div>
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
