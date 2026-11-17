import { API_MODE, fetchApi } from '@/lib/api';
import { Category } from './types';
import { mockShopCategories } from './mocks';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: BackendCategory[] }>(
      '/api/v1/product-categories?limit=100&isActive=true&includeCounts=true',
    );
    return { data: mapBackendCategories(response.data) };
  }
  await delay(400);
  return { data: mockShopCategories };
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
export async function createCategory(data: Partial<Category>): Promise<{ data: Category }> {
  await delay(800);
  const newCategory: Category = {
    id: `cat-${Date.now()}`,
    name: data.name || '',
    slug: data.slug || '',
    image: data.image,
    productCount: 0,
    sortOrder: 0,
    status: 'active',
    showInMenu: false,
    featuredMerchantIds: []
  };
  // In a real app this would save to the backend.
  // For the mock, we can push to the mockShopCategories array
  mockShopCategories.push(newCategory);
  return { data: newCategory };
}
