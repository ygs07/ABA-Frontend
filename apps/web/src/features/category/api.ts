import { API_MODE, fetchApi } from '@/lib/api';
import { Category } from './types';
import { mockShopCategories } from './mocks';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  productCount?: number;
  subcategories: ProductSubcategory[];
};

export type ProductSubcategory = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  productCount?: number;
};

export type BackendCategory = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  productCount?: number;
  product_count?: number;
  category_id?: number | null;
  parent_id?: number | null;
  parentId?: number | string | null;
  subcategories?: BackendCategory[];
};

export function mapBackendCategories(rows: BackendCategory[]): Category[] {
  const result: Category[] = [];
  const pushCategory = (category: BackendCategory, fallbackParentId?: string) => {
    const rawParentId = category.parentId ?? category.parent_id ?? category.category_id;
    const isSubcategory = fallbackParentId !== undefined || (rawParentId !== undefined && rawParentId !== null);
    const parentId = rawParentId !== undefined && rawParentId !== null
      ? String(rawParentId)
      : fallbackParentId;
    result.push({
      id: isSubcategory ? `sub-${category.id}` : String(category.id),
      name: category.name,
      slug: category.slug,
      parentId,
      productCount: Number(category.productCount ?? category.product_count ?? 0),
      sortOrder: 0,
      status: category.is_active ? 'active' : 'inactive',
      showInMenu: true,
      featuredMerchantIds: [],
    });
    if (Array.isArray(category.subcategories)) {
      category.subcategories.forEach((sub) => pushCategory(sub, String(category.id)));
    }
  };
  rows.forEach((row) => pushCategory(row));
  return result;
}

export async function getCategories(): Promise<{ data: Category[] }> {
  return getCategoryMenu();
}

export async function getCategoryHierarchy(): Promise<{ data: ProductCategory[] }> {
  if (API_MODE !== 'mock') {
    return fetchApi<{ data: ProductCategory[] }>('/api/v1/product-categories?limit=100&includeCounts=true');
  }
  await delay(400);
  return {
    data: mockShopCategories
      .filter((category) => !category.parentId)
      .map((category) => ({
        id: Number(category.id), name: category.name, slug: category.slug, description: null,
        is_active: category.status === 'active', productCount: category.productCount,
        subcategories: mockShopCategories.filter((sub) => sub.parentId === category.id).map((sub) => ({
          id: Number(String(sub.id).replace(/^sub-/, '')), category_id: Number(category.id), name: sub.name,
          slug: sub.slug, description: null, is_active: sub.status === 'active', productCount: sub.productCount,
        })),
      })),
  };
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
}) {
  return fetchApi<ProductCategory>('/api/v1/product-categories', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  });
}

export async function getCategoryMenu(): Promise<{ data: Category[] }> {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: BackendCategory[] }>(
      '/api/v1/product-categories?limit=100&isActive=true&includeCounts=true',
    );
    return { data: mapBackendCategories(response.data) };
  }
  await delay(400);
  return { data: mockShopCategories };
}

export async function createSubcategory(input: {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
}) {
  return fetchApi<ProductSubcategory>('/api/v1/product-subcategories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

