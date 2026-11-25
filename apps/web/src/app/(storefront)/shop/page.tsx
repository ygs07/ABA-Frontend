'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { getShopProducts, getShopMerchants } from '@/features/shop/api';
import { getCategoryMenu } from '@/features/category/api';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

import { AdsBanner } from './_components/AdsBanner';
import { ProductCarouselSection } from './_components/ProductCarouselSection';
import { PopularBrands } from './_components/PopularBrands';
import { RelatedSearches } from './_components/RelatedSearches';
import { ShopFilters } from './_components/ShopFilters';
import { InfiniteProductGrid } from './_components/InfiniteProductGrid';
import { ActiveFilterChips, type FilterChip } from './_components/ActiveFilterChips';
import { BackToTopButton } from './_components/BackToTopButton';
import { Product } from '@/features/products/types';
import { ProductQuickViewModal } from '../merchants/_components/ProductQuickViewModal';

type ShopSort = 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

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

  const { data: categoriesData } = useQuery({
    queryKey: ['category_menu'],
    queryFn: async () => (await getCategoryMenu()).data,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const resolvedCategoryFilter = useMemo(() => {
    if (!selectedCategory) return {};
    const segments = selectedCategory.split('/').filter(Boolean);
    const leafSlug = segments.at(-1);
    if (!leafSlug) return {};
    const list = categoriesData ?? [];
    const matched =
      segments.length > 1
        ? list.find((cat) => {
            if (cat.slug !== leafSlug) return false;
            const parent = list.find((p) => p.id === cat.parentId);
            return parent?.slug === segments[segments.length - 2];
          }) ?? list.find((cat) => cat.slug === leafSlug)
        : list.find((cat) => cat.slug === leafSlug && !cat.parentId) ??
          list.find((cat) => cat.slug === leafSlug);

    if (!matched) {
      return { categorySlug: leafSlug };
    }
    if (matched.parentId) {
      const subId = Number(String(matched.id).replace(/^sub-/, ''));
      return {
        subcategoryId: Number.isFinite(subId) ? subId : undefined,
        categorySlug: matched.slug,
      };
    }
    const catId = Number(matched.id);
    return {
      categoryId: Number.isFinite(catId) ? catId : undefined,
      categorySlug: matched.slug,
    };
  }, [selectedCategory, categoriesData]);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: [
      'shop_products',
      selectedCategory,
      resolvedCategoryFilter.categoryId,
      resolvedCategoryFilter.subcategoryId,
      selectedMerchant,
      searchTerm,
      sortBy,
    ],
    queryFn: async () => {
      const res = await getShopProducts({
        ...resolvedCategoryFilter,
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

  const filterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];
    if (selectedCategory) {
      chips.push({ key: 'category', label: `Category: ${selectedCategory}`, onRemove: () => updateUrlParams({ category: null }) });
    }
    if (searchTerm) {
      chips.push({ key: 'search', label: `Search: "${searchTerm}"`, onRemove: () => updateUrlParams({ search: null }) });
    }
    if (selectedMerchant) {
      const mName = merchantsData?.find((m) => m.id === selectedMerchant)?.name ?? 'Merchant';
      chips.push({ key: 'merchant', label: `Merchant: ${mName}`, onRemove: () => updateUrlParams({ merchant: null }) });
    }
    if (urlMinPrice) {
      chips.push({ key: 'minPrice', label: `Min: ₦${urlMinPrice}`, onRemove: () => { setMinPriceInput(''); updateUrlParams({ minPrice: null }); } });
    }
    if (urlMaxPrice) {
      chips.push({ key: 'maxPrice', label: `Max: ₦${urlMaxPrice}`, onRemove: () => { setMaxPriceInput(''); updateUrlParams({ maxPrice: null }); } });
    }
    if (inStockOnly) {
      chips.push({ key: 'inStock', label: 'In Stock Only', onRemove: () => updateUrlParams({ inStock: null }) });
    }
    if (minRating !== null) {
      chips.push({ key: 'rating', label: `${minRating}+ Stars`, onRemove: () => updateUrlParams({ rating: null }) });
    }
    return chips;
  }, [selectedCategory, searchTerm, selectedMerchant, merchantsData, urlMinPrice, urlMaxPrice, inStockOnly, minRating, updateUrlParams]);

  const filterKey = searchParams.toString() || 'all';

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

            <ActiveFilterChips chips={filterChips} onClearAll={handleClearAll} />

            {/* Hybrid Infinite Scroll + Load More Grid */}
            <InfiniteProductGrid
              key={filterKey}
              products={filteredProducts}
              isLoading={isLoadingProducts}
              filterKey={filterKey}
              onQuickView={setQuickViewProduct}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        <PopularBrands />
        <RelatedSearches />
      </div>

      <BackToTopButton />

      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
