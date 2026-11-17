'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2 } from 'lucide-react';
import { CategoryFilter } from '@/components/patterns/CategoryFilter';
import { EntityCard } from '@/components/patterns/EntityCard';
import { getCategoryMenu } from '@/features/category/api';
import { getShopProducts } from '@/features/shop/api';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams<{ categoryPath: string[] }>();
  const rawCategoryPath = params?.categoryPath;
  const categoryPath = Array.isArray(rawCategoryPath)
    ? rawCategoryPath
    : rawCategoryPath
      ? [rawCategoryPath]
      : [];
  const categorySlug = categoryPath.at(-1) ?? '';
  const { data: categoryResponse, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['category-menu'],
    queryFn: getCategoryMenu,
  });
  const categories = categoryResponse?.data ?? [];
  const currentCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug),
    [categories, categorySlug],
  );
  const parentCategory = currentCategory?.parentId
    ? categories.find((category) => category.id === currentCategory.parentId)
    : undefined;
  const canonicalPath = currentCategory
    ? parentCategory
      ? `${parentCategory.slug}/${currentCategory.slug}`
      : currentCategory.slug
    : '';

  useEffect(() => {
    if (canonicalPath && categoryPath.join('/') !== canonicalPath) {
      router.replace(`/c/${canonicalPath}`);
    }
  }, [canonicalPath, categoryPath, router]);

  const { data: productResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['category-products', currentCategory?.id],
    queryFn: () => getShopProducts(
      currentCategory?.parentId
        ? { subcategoryId: Number(currentCategory.id) }
        : { categoryId: Number(currentCategory?.id) },
    ),
    enabled: Boolean(currentCategory),
  });

  if (categoriesLoading || (canonicalPath && categoryPath.join('/') !== canonicalPath)) {
    return <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }
  if (categoriesError || !currentCategory) {
    return <div className="mx-auto max-w-7xl px-4 py-32 text-center"><h1 className="text-2xl font-bold text-text">Category not found</h1><Link className="mt-4 inline-block text-brand-600 hover:underline" href="/shop">Browse all products</Link></div>;
  }

  const products = productResponse?.data ?? [];
  const children = currentCategory.parentId ? [] : categories.filter((category) => category.parentId === currentCategory.id);
  const crumbs = canonicalPath.split('/');
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 md:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted"><Link href="/" className="hover:text-brand-600">Home</Link><ChevronRight className="h-4 w-4" />{crumbs.map((slug, index) => <span key={`${slug}-${index}`} className={index === crumbs.length - 1 ? 'font-semibold text-text' : ''}>{index ? <><span>{categories.find((category) => category.slug === slug)?.name ?? slug}</span><ChevronRight className="ml-2 inline h-4 w-4" /></> : categories.find((category) => category.slug === slug)?.name ?? slug}</span>)}</nav>
      <div className="flex flex-col gap-8 lg:flex-row"><aside className="w-full shrink-0 lg:w-60"><CategoryFilter /></aside><main className="min-w-0 flex-1"><div className="mb-6"><h1 className="text-3xl font-bold text-text">{currentCategory.name}</h1><p className="mt-2 text-text-muted">{products.length} products found</p></div>{children.length > 0 && <div className="mb-8 flex gap-2 overflow-x-auto pb-2">{children.map((child) => <Link key={child.id} href={`/c/${currentCategory.slug}/${child.slug}`} className="whitespace-nowrap rounded-full border border-border bg-white px-4 py-2 text-sm font-medium hover:border-brand-500 hover:text-brand-600">{child.name}</Link>)}</div>}<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 md:gap-6">{productsLoading ? <div className="col-span-full flex h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-600" /></div> : products.length ? products.map((product) => <EntityCard key={product.id} type="product" entity={product} />) : <div className="col-span-full rounded-xl border border-dashed border-border bg-surface-1 py-12 text-center text-text-muted">No products found in this category.</div>}</div></main></div>
    </div>
  );
}
