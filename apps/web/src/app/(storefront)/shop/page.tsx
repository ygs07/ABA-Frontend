'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { getShopProducts, getShopMerchants } from '@/features/shop/api';
import { ProductCard } from '@/components/storefront/ProductCard';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Pagination } from '@/components/ui/pagination';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

import { AdsBanner } from './_components/AdsBanner';
import { ProductCarouselSection } from './_components/ProductCarouselSection';
import { PopularBrands } from './_components/PopularBrands';
import { RelatedSearches } from './_components/RelatedSearches';
import { ShopFilters } from './_components/ShopFilters';
import { Product } from '@/features/products/types';
import { ProductQuickViewModal } from '../merchants/_components/ProductQuickViewModal';

type ShopSort = 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
const PAGE_SIZE = 12;

export default function ShopPage() {
  return (
    <React.Suspense
      fallback={
        <div className="h-96 flex items-center justify-center" aria-busy="true">
          Loading…
        </div>
      }
    >
      <ShopContent />
    </React.Suspense>
  );
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');
  const selectedMerchant = searchParams.get('merchant');
  const urlMinPrice = searchParams.get('minPrice') ?? '';
  const urlMaxPrice = searchParams.get('maxPrice') ?? '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const rawRating = searchParams.get('rating');
  const minRating = rawRating ? Number(rawRating) : null;
  const sortBy = (searchParams.get('sort') as ShopSort | null) ?? 'recommended';
  const rawPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const [minPriceInput, setMinPriceInput] = useState(urlMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(urlMaxPrice);
  const debouncedMinPrice = useDebouncedValue(minPriceInput, 350);
  const debouncedMaxPrice = useDebouncedValue(maxPriceInput, 350);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      if (resetPage) {
        next.delete('page');
      }
      const query = next.toString();
      router.replace(query ? `/shop?${query}` : '/shop', { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (debouncedMinPrice === urlMinPrice && debouncedMaxPrice === urlMaxPrice) return;
    updateUrlParams({
      minPrice: debouncedMinPrice.trim() || null,
      maxPrice: debouncedMaxPrice.trim() || null,
    });
  }, [debouncedMinPrice, debouncedMaxPrice, urlMinPrice, urlMaxPrice, updateUrlParams]);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['shop_products', selectedCategory, selectedMerchant, searchTerm, sortBy],
    queryFn: async () => {
      const res = await getShopProducts({
        categorySlug: selectedCategory || undefined,
        merchantId: selectedMerchant || undefined,
        q: searchTerm || undefined,
        sort: sortBy,
      });
      return res.data;
    },
  });

  const { data: merchantsData } = useQuery({
    queryKey: ['shop_merchants'],
    queryFn: async () => (await getShopMerchants()).data,
  });

  const handleClearAll = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    router.replace('/shop', { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    const items = [...(productsData ?? [])];
    const minKobo = urlMinPrice.trim() ? Number(urlMinPrice) * 100 : null;
    const maxKobo = urlMaxPrice.trim() ? Number(urlMaxPrice) * 100 : null;

    const filtered = items.filter((product) => {
      if (selectedMerchant && product.merchant?.id !== selectedMerchant) return false;
      if (minKobo !== null && Number.isFinite(minKobo) && product.price < minKobo) return false;
      if (maxKobo !== null && Number.isFinite(maxKobo) && product.price > maxKobo) return false;
      if (inStockOnly && product.totalStock <= 0) return false;
      if (minRating !== null && Number.isFinite(minRating) && (product.rating || 0) < minRating) return false;
      return true;
    });

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return filtered;
  }, [productsData, selectedMerchant, urlMinPrice, urlMaxPrice, inStockOnly, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const filterProps = {
    merchants: merchantsData || [],
    selectedMerchant,
    setSelectedMerchant: (id: string | null) => updateUrlParams({ merchant: id }),
    minPrice: minPriceInput,
    setMinPrice: setMinPriceInput,
    maxPrice: maxPriceInput,
    setMaxPrice: setMaxPriceInput,
    inStockOnly,
    setInStockOnly: (val: boolean) => updateUrlParams({ inStock: val ? 'true' : null }),
    minRating,
    setMinRating: (val: number | null) => updateUrlParams({ rating: val !== null ? String(val) : null }),
    onClearAll: handleClearAll,
  };

  return (
    <div className="flex mx-auto flex-col mt-20 w-full font-sans animate-in fade-in duration-1000 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumbs & Title */}
        <div className="mb-6">
          <nav className="text-sm text-text-muted mb-2">
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-text">Shop</span>
          </nav>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-text">
              {searchTerm
                ? `Search results for "${searchTerm}"`
                : `Shop ${selectedCategory ? selectedCategory : 'All Categories'}`}
            </h1>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" className="lg:hidden flex items-center gap-2" />}>
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px] overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-6">
                  <ShopFilters {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-[240px] shrink-0 hidden lg:block space-y-6 sticky top-40 self-start">
            <ShopFilters {...filterProps} />
          </aside>

          {/* Main Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-text-muted">
                {isLoadingProducts ? 'Loading...' : `Showing ${filteredProducts.length} results`}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Sort by:</span>
                <select
                  aria-label="Sort products"
                  value={sortBy}
                  onChange={(e) =>
                    updateUrlParams({
                      sort: e.target.value === 'recommended' ? null : e.target.value,
                    })
                  }
                  className="h-9 px-3 py-1 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="recommended">Relevance</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <AdsBanner />
            <ProductCarouselSection title="Best Selling" sliceStart={0} sliceEnd={10} />
            <ProductCarouselSection title="Limited Time Deals" sliceStart={4} sliceEnd={12} />

            {/* Grid */}
            {isLoadingProducts ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                title="No products found matching your filters."
                description="Try adjusting your search or clearing your active filters."
                actionLabel="Clear Filters"
                onAction={handleClearAll}
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > PAGE_SIZE && (
              <Pagination
                meta={{
                  page: safePage,
                  totalPages,
                  total: filteredProducts.length,
                }}
                variant="numbered"
                onPageChange={(nextPage) =>
                  updateUrlParams({ page: nextPage > 1 ? String(nextPage) : null }, false)
                }
              />
            )}
          </div>
        </div>

        <PopularBrands />
        <RelatedSearches />
      </div>

      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
