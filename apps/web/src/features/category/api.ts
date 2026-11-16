import { API_MODE, fetchApi } from '@/lib/api';
import { Category } from './types';
import { mockShopCategories } from './mocks';

export type ProductSubcategory = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  productCount?: number;
};

export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  productCount?: number;
  subcategories: ProductSubcategory[];
};

type Paginated<T> = { data: T[]; meta?: { totalItems: number; totalPages: number; currentPage: number } };

export async function getCategoryHierarchy(): Promise<Paginated<ProductCategory>> {
  if (API_MODE === 'mock') {
    return {
      data: mockShopCategories.filter((category) => !category.parentId).map((category) => ({
        id: Number(category.id.replace(/\D/g, '')) || 0,
        name: category.name,
        slug: category.slug,
        description: null,
        is_active: category.status === 'active',
        productCount: category.productCount,
        subcategories: mockShopCategories.filter((child) => child.parentId === category.id).map((child) => ({
          id: Number(child.id.replace(/\D/g, '')) || 0,
          category_id: Number(category.id.replace(/\D/g, '')) || 0,
          name: child.name,
          slug: child.slug,
          description: null,
          is_active: child.status === 'active',
          productCount: child.productCount,
        })),
      })),
    };
  }
  return fetchApi<Paginated<ProductCategory>>('/api/v1/product-categories?limit=100&includeCounts=true');
}

export async function getCategories(): Promise<{ data: Category[] }> {
  const response = await getCategoryHierarchy();
  return {
    data: response.data.filter((category) => category.is_active).map(toCategory),
  };
}

export async function getCategoryMenu(): Promise<{ data: Category[] }> {
  const response = await getCategoryHierarchy();
  return {
    data: response.data
      .filter((category) => category.is_active)
      .flatMap((category) => [
        toCategory(category),
        ...category.subcategories
          .filter((subcategory) => subcategory.is_active)
          .map((subcategory) => toCategory(subcategory, category.id)),
      ]),
  };
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
}) {
  return fetchApi<ProductCategory>('/api/v1/product-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
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

function toCategory(category: ProductCategory | ProductSubcategory, parentId?: number): Category {
  const isSubcategory = 'category_id' in category;
  return {
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    parentId: isSubcategory ? String(category.category_id) : parentId ? String(parentId) : null,
    sortOrder: 0,
    status: category.is_active ? 'active' : 'inactive',
    showInMenu: true,
    featuredMerchantIds: [],
    productCount: category.productCount ?? 0,
  };
}
