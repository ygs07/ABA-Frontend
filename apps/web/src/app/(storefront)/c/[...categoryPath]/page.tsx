import React from 'react';
import Link from 'next/link';
import { getShopProducts, getShopCategories } from '@/features/shop/api';
import { CategoryFilter } from '@/components/patterns/CategoryFilter';
import { EntityCard } from '@/components/patterns/EntityCard';
import { StorefrontEmptyState } from '@/components/patterns/StorefrontEmptyState';
import { ChevronRight } from 'lucide-react';

function formatSlugLabel(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function CategoryPage({ params }: { params: Promise<{ categoryPath: string[] }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { categoryPath } = await params;

  // Find the leaf category slug (the last element of the array)
  const categorySlug = categoryPath[categoryPath.length - 1];

  let categories: Awaited<ReturnType<typeof getShopCategories>>['data'] = [];
  let loadError = false;
  try {
    const res = await getShopCategories();
    categories = res.data;
  } catch {
    loadError = true;
  }

  const currentCategory = categories.find((c) => c.slug === categorySlug);

  if (!currentCategory) {
    const topCategories = categories.filter((c) => !c.parentId).slice(0, 8);
    const requestedLabel = formatSlugLabel(categorySlug);

    return (
      <StorefrontEmptyState
        breadcrumbLabel={requestedLabel}
        title={
          loadError
            ? 'We could not load this category right now'
            : `No listings found for "${requestedLabel}"`
        }
        description={
          loadError
            ? 'There was a temporary issue loading category details. You can browse all products or try again shortly.'
            : 'This category may have been renamed, moved, or does not have active products yet.'
        }
        suggestionsTitle="Explore Available Categories"
        suggestions={topCategories.map((cat) => ({
          id: cat.id,
          label: cat.name,
          href: `/c/${cat.slug}`,
        }))}
      />
    );
  }

  // Fetch products
  const { data: products } = await getShopProducts({ categorySlug });

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
              <p className="text-text-muted mt-2">{products.length} products found</p>
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
              products.map(product => (
                <EntityCard 
                  key={product.id} 
                  type="product" 
                  entity={product}
                />
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
