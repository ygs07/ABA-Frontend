'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getShopCategories, getShopProducts } from '@/features/shop/api';
import { CategoryFilter } from '@/components/patterns/CategoryFilter';
import { ProductCard } from '@/components/storefront/ProductCard';
import { StorefrontEmptyState } from '@/components/patterns/StorefrontEmptyState';

function formatSlugLabel(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CategoryPage() {
  const params = useParams<{ categoryPath: string[] }>();
  const categoryPath = Array.isArray(params.categoryPath) ? params.categoryPath : [];
  const categorySlug = categoryPath.at(-1);
  const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: getShopCategories,
  });
  const categories = categoriesData?.data ?? [];
  const currentCategory = categories.find((category) => category.slug === categorySlug);
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['category-products', currentCategory?.id, categorySlug],
    queryFn: () => getShopProducts({
      categoryId: currentCategory?.parentId ? undefined : Number(currentCategory?.id),
      subcategoryId: currentCategory?.parentId ? Number(String(currentCategory.id).replace(/^sub-/, '')) : undefined,
      categorySlug,
    }),
    enabled: Boolean(currentCategory),
  });

  if (categoriesLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }
  if (categoriesError || !currentCategory) {
    return <div className="mx-auto max-w-7xl px-4 py-32 text-center"><h1 className="text-2xl font-bold text-text">Category not found</h1><Link className="mt-4 inline-block text-brand-600 hover:underline" href="/shop">Browse all products</Link></div>;
  }

  const products = productsData?.data ?? [];

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
              <p className="text-text-muted mt-2">{productsLoading ? 'Loading products…' : `${products.length} products found`}</p>
            </div>
            
            <select className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-brand-500">
              <option>Recommended</option>
              <option>Newest Arrivals</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
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

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-surface-1 rounded-xl border border-border border-dashed">
                <p className="text-text-muted font-medium">No products found in this category.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
