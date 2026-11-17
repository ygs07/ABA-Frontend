'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FolderTree, Loader2, Plus, Search, Tag } from 'lucide-react';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCategoryHierarchy } from '@/features/category/api';

export function CategoriesTree() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useQuery({ queryKey: ['product-category-hierarchy'], queryFn: getCategoryHierarchy });
  const categories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data?.data ?? [];
    return (data?.data ?? []).filter((category) => category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term) || category.subcategories.some((subcategory) => subcategory.name.toLowerCase().includes(term) || subcategory.slug.toLowerCase().includes(term)));
  }, [data?.data, search]);

  return (
    <div className="space-y-6 pb-20">
      <PageHeader title="Categories" description="Manage top-level product categories and their subcategories." action={<div className="flex gap-2"><Button variant="outline" asChild><Link href="/erp/categories/new?type=subcategory"><Plus className="mr-1.5 h-4 w-4" />Add subcategory</Link></Button><Button asChild><Link href="/erp/categories/new"><Plus className="mr-1.5 h-4 w-4" />Add category</Link></Button></div>} />
      <div className="max-w-md"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search categories or subcategories…" /></div></div>
      {isLoading ? <div className="flex min-h-48 items-center justify-center text-sm text-text-muted"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading catalogue structure…</div> : error ? <div className="rounded-xl border border-error-border bg-error-bg p-4 text-sm text-error">Unable to load categories. Please refresh and try again.</div> : categories.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center"><FolderTree className="mx-auto h-7 w-7 text-text-muted" /><h2 className="mt-3 font-semibold text-text">No matching categories</h2><p className="mt-1 text-sm text-text-muted">Create a top-level category, then add subcategories beneath it.</p></div> : <div className="space-y-4">{categories.map((category) => <section key={category.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"><div className="flex flex-col justify-between gap-3 border-b border-border bg-surface-1 p-5 sm:flex-row sm:items-center"><div className="flex items-start gap-3"><FolderTree className="mt-0.5 h-5 w-5 text-brand-600" /><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-text">{category.name}</h2><Badge variant={category.is_active ? 'default' : 'secondary'}>{category.is_active ? 'Active' : 'Inactive'}</Badge></div><p className="mt-1 text-xs text-text-muted">/{category.slug}{category.description ? ` · ${category.description}` : ''}</p></div></div><div className="text-sm text-text-muted">{category.productCount ?? 0} product{(category.productCount ?? 0) === 1 ? '' : 's'} · {category.subcategories.length} subcategor{category.subcategories.length === 1 ? 'y' : 'ies'}</div></div><div className="divide-y divide-border">{category.subcategories.length ? category.subcategories.map((subcategory) => <div key={subcategory.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Tag className="mt-0.5 h-4 w-4 text-text-muted" /><div><div className="flex items-center gap-2"><span className="text-sm font-medium text-text">{subcategory.name}</span><Badge variant={subcategory.is_active ? 'default' : 'secondary'}>{subcategory.is_active ? 'Active' : 'Inactive'}</Badge></div><p className="mt-1 text-xs text-text-muted">/{category.slug}/{subcategory.slug}{subcategory.description ? ` · ${subcategory.description}` : ''}</p></div></div><span className="text-sm text-text-muted">{subcategory.productCount ?? 0} product{(subcategory.productCount ?? 0) === 1 ? '' : 's'}</span></div>) : <p className="p-4 text-sm text-text-muted">No subcategories yet.</p>}</div></section>)}</div>}
    </div>
  );
}
