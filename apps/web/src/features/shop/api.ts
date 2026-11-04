import { API_MODE, ApiError, fetchApi } from '@/lib/api';
import { mockShopMerchants, mockShopProducts } from './mocks';
import { Merchant } from '../merchants/types';
import { Category } from '../category/types';
import { Product } from '../products/types';
import { mockShopCategories } from '../category/mocks';
import { DirectoryMerchant, DirectoryParams, DirectoryResult } from '../merchants/types';
import { queryDirectory } from '../merchants/directory';
import { storefrontConfig } from '@/config/storefront';
import { maybeInjectMockError } from '@/lib/mockErrors';
import { toProduct } from '../products/api/products.api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getShopCategories(): Promise<{ data: Category[] }> {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: Array<{
      id: number;
      name: string;
      slug: string;
      is_active: boolean;
      productCount?: number;
    }> }>('/api/v1/product-categories?limit=100&includeCounts=true');
    return {
      data: response.data.map((category) => ({
        id: String(category.id),
        name: category.name,
        slug: category.slug,
        productCount: category.productCount ?? 0,
        sortOrder: 0,
        status: category.is_active ? 'active' : 'inactive',
        showInMenu: false,
        featuredMerchantIds: [],
      })),
    };
  }
  await delay(400);
  return { data: mockShopCategories };
}

export async function getShopMerchants(): Promise<{ data: Merchant[] }> {
  if (API_MODE !== 'mock') {
    const merchants = await fetchApi<Array<{
      id: number;
      businessName: string;
      website?: string | null;
      productCount?: string | number;
    }>>('/api/v1/storefront/merchants-spotlight');
    return {
      data: merchants.map((merchant) => ({
        id: String(merchant.id),
        name: merchant.businessName,
        legalName: merchant.businessName,
        merchantNo: `MER-${merchant.id}`,
        type: 'Own outlet',
        ownerName: merchant.businessName,
        address: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        website: merchant.website ?? undefined,
        isVerified: true,
        status: 'Active',
        onboardedAt: '',
        settlementBank: { bankName: '', accountNumber: '', accountName: '' },
        settlementFrequency: 'Weekly',
        priceList: 'Default',
        discountLimit: 0,
        creditLimit: 0,
        salesPeriod: 0,
        ordersCount: 0,
        stockValue: 0,
        outstandingBalance: 0,
      })),
    };
  }
  await delay(400);
  // Storefront only lists active merchants (REQ-06-266).
  return { data: mockShopMerchants.filter(m => m.status === 'Active') };
}

/** `GET /merchants/directory` : search, filters, sort and pagination of 24 (Doc 06 §6.2). */
export async function getDirectoryMerchants(params: DirectoryParams = {}): Promise<DirectoryResult> {
  if (API_MODE !== 'mock') {
    const search = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.pageSize ?? storefrontConfig.merchantDirectory.pageSize),
    });
    if (params.q) search.set('search', params.q);
    if (params.sort === 'newest') search.set('orderBy', 'createdAt:DESC');
    if (params.sort === 'rating') search.set('orderBy', 'rating:DESC');
    if (params.sort === 'orders') search.set('orderBy', 'ordersCount:DESC');

    const response = await fetchApi<{
      data: Array<{
        id: number;
        business_name: string;
        business_address?: string | null;
        website?: string | null;
        bio?: string | null;
        merchant_type: 1 | 2 | 3;
        verified_at?: string | null;
        createdAt?: string;
        avatar?: { url: string } | null;
        banner?: { url: string } | null;
        ordersCount?: number;
        rating?: number;
        reviewCount?: number;
        location?: { street_address: string; city: string; state: string; lga?: string | null } | null;
      }>;
      meta: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
      };
    }>(`/api/v1/storefront/merchants?${search.toString()}`);

    return {
      data: response.data.map((merchant) => ({
        id: String(merchant.id),
        merchantNo: `MER-${merchant.id}`,
        name: merchant.business_name,
        legalName: merchant.business_name,
        type: merchant.merchant_type === 1 ? 'Own outlet' : merchant.merchant_type === 2 ? 'Franchise' : 'Partner',
        description: merchant.bio ?? undefined,
        isVerified: Boolean(merchant.verified_at),
        ownerName: '',
        phone: '',
        email: '',
        website: merchant.website ?? undefined,
        address: merchant.location?.street_address ?? merchant.business_address ?? '',
        city: merchant.location?.city ?? '',
        state: merchant.location?.state ?? '',
        lga: merchant.location?.lga ?? undefined,
        logoUrl: merchant.avatar?.url,
        bannerImage: merchant.banner?.url,
        settlementBank: { bankName: '', accountNumber: '', accountName: '' },
        settlementFrequency: 'Weekly',
        priceList: 'Default',
        discountLimit: 0,
        creditLimit: 0,
        status: 'Active',
        onboardedAt: merchant.createdAt ?? new Date().toISOString(),
        salesPeriod: 0,
        ordersCount: Number(merchant.ordersCount ?? 0),
        stockValue: 0,
        outstandingBalance: 0,
        rating: Number(merchant.rating ?? 0),
        reviewCount: Number(merchant.reviewCount ?? 0),
        categoryPaths: [],
        spotlightScore: 0,
        isFeatured: false,
      })),
      meta: {
        page: response.meta.currentPage,
        total: response.meta.totalItems,
        totalPages: response.meta.totalPages,
      },
      facets: { states: [] },
    };
  }
  await delay(500);
  maybeInjectMockError('directory');
  return queryDirectory(mockShopMerchants, params, {
    pageSize: storefrontConfig.merchantDirectory.pageSize,
    defaultOrder: storefrontConfig.merchantDirectory.defaultOrder,
    spotlight: storefrontConfig.spotlight,
  });
}

/** `GET /merchants/meet-businesses` : spotlight-ordered merchants for the shop landing carousel (Doc 06 §6.1). */
export async function getMeetBusinesses(): Promise<{ data: DirectoryMerchant[] }> {
  const res = await getDirectoryMerchants({ sort: 'recommended', pageSize: storefrontConfig.meetBusinesses.limit });
  return { data: res.data };
}

export async function getShopProducts(params?: { 
  categorySlug?: string; 
  merchantId?: string;
  q?: string;
  minRating?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  sort?: 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
}): Promise<{ data: Product[] }> {
  if (API_MODE !== 'mock') {
    const search = new URLSearchParams({ limit: '100', includeVariants: 'true' });
    if (params?.merchantId) search.set('merchantId', params.merchantId);
    if (params?.q) search.set('search', params.q);
    if (params?.sort === 'rating') search.set('orderBy', 'ratings:DESC');
    if (params?.sort === 'newest') search.set('orderBy', 'createdAt:DESC');
    const response = await fetchApi<{ data: Parameters<typeof toProduct>[0][] }>(
      `/api/v1/storefront/products?${search.toString()}`,
    );
    return { data: response.data.map(toProduct) };
  }
  await delay(600);
  let products = [...mockShopProducts];

  if (params?.categorySlug) {
    products = products.filter(p => p.category?.slug === params.categorySlug);
  }
  if (params?.merchantId) {
    products = products.filter(p => p.merchant?.id === params.merchantId);
  }
  if (params?.q) {
    const q = params.q.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }
  if (params?.minRating) {
    products = products.filter(p => p.rating >= params.minRating!);
  }
  if (params?.inStockOnly) {
    products = products.filter(p => p.totalStock > 0);
  }
  if (params?.onSaleOnly) {
    products = products.filter(p => p.originalPrice && p.originalPrice > p.price);
  }

  if (params?.sort) {
    products.sort((a, b) => {
      switch (params.sort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'newest': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default: return 0;
      }
    });
  }

  return { data: products };
}

export async function getShopProductBySlug(slug: string): Promise<{ data: Product }> {
  await delay(400);
  const product = mockShopProducts.find(p => p.slug === slug);
  if (!product) {
    throw new ApiError(404, 'Product not found', 'NOT_FOUND');
  }
  return { data: product };
}
