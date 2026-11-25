'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getCategoryMenu } from '@/features/category/api';
import { getShopProducts } from '@/features/shop/api';
import { CategoryFilter } from '@/components/patterns/CategoryFilter';
import { InfiniteProductGrid } from '@/app/(storefront)/shop/_components/InfiniteProductGrid';
import { BackToTopButton } from '@/app/(storefront)/shop/_components/BackToTopButton';
import { ProductQuickViewModal } from '@/app/(storefront)/merchants/_components/ProductQuickViewModal';
import { Product } from '@/features/products/types';

type CategorySort = 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams<{ categoryPath: string[] }>();
  const categoryPath = Array.isArray(params.categoryPath) ? params.categoryPath : [];
  const categorySlug = categoryPath.at(-1);
  const [sortBy, setSortBy] = useState<CategorySort>('recommended');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ['category_menu'],
    queryFn: async () => (await getCategoryMenu()).data,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  const currentCategory =
    categoryPath.length > 1
      ? categories.find((category) => {
          if (category.slug !== categorySlug) return false;
          const parent = categories.find((p) => p.id === category.parentId);
          return parent?.slug === categoryPath[categoryPath.length - 2];
        }) ?? categories.find((category) => category.slug === categorySlug)
      : categories.find((category) => category.slug === categorySlug && !category.parentId) ??
        categories.find((category) => category.slug === categorySlug);
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['category-products', currentCategory?.id, categorySlug],
    queryFn: () => getShopProducts({
      categoryId: currentCategory?.parentId ? undefined : Number(currentCategory?.id),
      subcategoryId: currentCategory?.parentId ? Number(String(currentCategory.id).replace(/^sub-/, '')) : undefined,
      categorySlug,
    }),
    enabled: Boolean(currentCategory),
  });

  const sortedProducts = useMemo(() => {
    const items = [...(productsData?.data ?? [])];
    if (sortBy === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return items;
  }, [productsData?.data, sortBy]);

  if (categoriesLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }
  if (categoriesError || !currentCategory) {
    return <div className="mx-auto max-w-7xl px-4 py-32 text-center"><h1 className="text-2xl font-bold text-text">Category not found</h1><Link className="mt-4 inline-block text-brand-600 hover:underline" href="/shop">Browse all products</Link></div>;
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 md:px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        {categoryPath.map((pathItem, index) => {
          const isLast = index === categoryPath.length - 1;
          const href = `/c/${categoryPath.slice(0, index + 1).join('/')}`;
          // Display the slug directly (or map back to name in a real app)
          const displayName = categories.find(c => c.slug === pathItem)?.name || pathItem;
          
          return (
            <React.Fragment key={pathItem}>
              {isLast ? (
                <span className="font-semibold text-text">{displayName}</span>
              ) : (
                <>
                  <Link href={href} className="hover:text-brand-600">{displayName}</Link>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-[240px] shrink-0 space-y-6">
          <CategoryFilter />
          {/* We could add price/brand filters here */}
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text">{currentCategory.name}</h1>
              <p className="text-text-muted mt-2">{productsLoading ? 'Loading products…' : `${sortedProducts.length} products found`}</p>
            </div>
            
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CategorySort)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-brand-500"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          
          {/* Subcategory Chips (Mocked) */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.filter(c => c.parentId === currentCategory.id).map(sub => (
              <Link 
                key={sub.id} 
                href={`/c/${categoryPath.join('/')}/${sub.slug}`}
                className="px-4 py-2 border border-border rounded-full bg-white text-sm font-medium hover:border-store-accent hover:bg-store-accent-tint hover:text-store-accent-text transition-colors whitespace-nowrap"
              >
                {sub.name}
              </Link>
            ))}
          </div>

          {/* Product Grid with Infinite Scroll & Skeletons */}
          <InfiniteProductGrid
            key={`cat-${categoryPath.join('/')}-${sortBy}`}
            products={sortedProducts}
            isLoading={productsLoading}
            filterKey={`cat:${categoryPath.join('/')}:${sortBy}`}
            onQuickView={setQuickViewProduct}
            onClearAll={() => router.push('/shop')}
          />
        </main>
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
