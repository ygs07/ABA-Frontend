import { API_MODE, fetchApi } from '@/lib/api';
import { mockShopProducts } from '@/features/shop/mocks';
import { CreateProductInput } from '../schemas';
import { Product, ProductVariant } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const MOCK_PRODUCTS = mockShopProducts;

type BackendVariant = {
  id: number | string;
  name: string;
  sku: string;
  barcode?: string | null;
  price: string | number;
  cost_price?: string | number | null;
  is_active: boolean;
  attributes?: Record<string, string> | null;
  stock_quantity?: number;
};

type BackendProduct = {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  brand?: { id: number; name: string } | string | null;
  base_cost_price?: string | number | null;
  base_selling_price?: string | number | null;
  base_unit_of_measurement?: string | null;
  type?: Product['type'] | null;
  reorder_level?: number;
  reorder_quantity?: number;
  is_active: boolean;
  category?: { id: number; name: string } | null;
  merchant?: { id: number; business_name: string } | null;
  images?: Array<{ id: number; url: string; original_name?: string } | string>;
  variants?: BackendVariant[];
  updatedAt?: string;
  updated_at?: string;
  total_stock?: number;
  ratings?: string | number;
  reviewCount?: string | number;
};

type PaginatedProducts = { data: BackendProduct[] };

export type ProductBrandOption = {
  id: number;
  name: string;
  slug: string;
  is_verified: boolean;
};

export type ProductOverview = {
  totalProducts: number;
  activeProducts: number;
  lowStock: number;
  outOfStock: number;
};

const numberValue = (value?: string | number | null) =>
  value === null || value === undefined ? 0 : Number(value);
const nairaToKobo = (value?: string | number | null) =>
  Math.round(numberValue(value) * 100);

function toVariant(variant: BackendVariant): ProductVariant {
  return {
    id: String(variant.id),
    name: variant.name,
    sku: variant.sku,
    barcode: variant.barcode ?? undefined,
    price: nairaToKobo(variant.price),
    cost: nairaToKobo(variant.cost_price),
    reorderLevel: 0,
    images: [],
    isActive: variant.is_active,
    stockCount: variant.stock_quantity ?? 0,
    attributes: variant.attributes
      ? Object.entries(variant.attributes).map(([name, value]) => ({ name, type: 'text', value }))
      : undefined,
  };
}

export function toProduct(product: BackendProduct): Product {
  const variants = product.variants?.map(toVariant) ?? [];
  const price = nairaToKobo(product.base_selling_price) || variants[0]?.price || 0;
  const sellingPrice = price;

  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    // The backend catalog does not yet persist a base-product SKU or price.
    sku: product.slug.toUpperCase(),
    type: product.type ?? 'Finished good',
    categoryName: product.category?.name ?? 'Uncategorized',
    category: product.category
      ? { id: String(product.category.id), name: product.category.name } as Product['category']
      : undefined,
    brand: typeof product.brand === 'string' ? product.brand : product.brand?.name,
    description: product.description ?? undefined,
    unitOfMeasure: product.base_unit_of_measurement ?? 'unit',
    status: product.is_active ? 'Active' : 'Draft',
    images: (product.images ?? []).map((image) =>
      typeof image === 'string' ? image : image.url,
    ),
    price,
    sellingPrice,
    priceIncludesTax: true,
    hasVariants: variants.length > 0,
    variants,
    trackInventory: false,
    reorderLevel: product.reorder_level ?? 0,
    reorderQuantity: product.reorder_quantity ?? 0,
    allowBackorder: false,
    isCommissionable: false,
    totalStock: product.total_stock ?? variants.reduce((total, variant) => total + variant.stockCount, 0),
    updatedAt: product.updatedAt ?? product.updated_at ?? new Date().toISOString(),
    rating: numberValue(product.ratings),
    reviewCount: Number(product.reviewCount ?? 0),
    merchant: product.merchant
      ? ({
          id: String(product.merchant.id),
          name: product.merchant.business_name,
        } as Product['merchant'])
      : undefined,
  };
}

export const getProducts = async (): Promise<{ data: Product[] }> => {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<PaginatedProducts>('/api/v1/products?limit=100&includeVariants=true');
    return { data: response.data.map(toProduct) };
  }

  await delay(500);
  return { data: MOCK_PRODUCTS };
};

export const getProductBrands = async (): Promise<{ data: ProductBrandOption[] }> => {
  if (API_MODE !== 'mock') {
    return fetchApi<{ data: ProductBrandOption[] }>('/api/v1/product-brands?limit=100');
  }

  return { data: [] };
};

export const getProductOverview = async (): Promise<ProductOverview> => {
  if (API_MODE !== 'mock') {
    return fetchApi<ProductOverview>('/api/v1/products/overview');
  }

  await delay(250);
  return {
    totalProducts: MOCK_PRODUCTS.length,
    activeProducts: MOCK_PRODUCTS.filter((product) => product.status === 'Active').length,
    lowStock: MOCK_PRODUCTS.filter(
      (product) => product.totalStock > 0 && product.totalStock <= product.reorderLevel,
    ).length,
    outOfStock: MOCK_PRODUCTS.filter((product) => product.totalStock === 0).length,
  };
};

export const getProductById = async (id: string): Promise<Product> => {
  if (API_MODE !== 'mock') {
    const product = await fetchApi<BackendProduct>(`/api/v1/products/${encodeURIComponent(id)}`);
    return toProduct(product);
  }

  await delay(500);
  const product = MOCK_PRODUCTS.find((item) => item.id === id);
  if (!product) throw new Error('Product not found');
  return product;
};

export type UpdateProductInput = {
  name: string;
  description?: string;
  baseCostPrice: number;
  baseSellingPrice: number;
  baseUnitOfMeasurement: string;
  type: Product['type'];
  reorderLevel: number;
  reorderQuantity: number;
  isActive: boolean;
};

export const updateProduct = async (id: string, input: UpdateProductInput): Promise<Product> => {
  const productTypeMap: Record<Product['type'], number> = {
    'Finished good': 1,
    'Raw material': 2,
    Service: 3,
    Bundle: 4,
  };
  const product = await fetchApi<BackendProduct>(`/api/v1/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      description: input.description || undefined,
      baseCostPrice: String(input.baseCostPrice),
      baseSellingPrice: String(input.baseSellingPrice),
      baseUnitOfMeasurement: input.baseUnitOfMeasurement,
      type: productTypeMap[input.type],
      reorderLevel: input.reorderLevel,
      reorderQuantity: input.reorderQuantity,
      isActive: input.isActive,
    }),
  });
  return toProduct(product);
};

export type CreateProductVariantInput = {
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  isActive?: boolean;
};

export async function createProductVariant(
  productId: string,
  input: CreateProductVariantInput,
): Promise<ProductVariant> {
  const variant = await fetchApi<BackendVariant>(
    `/api/v1/products/${encodeURIComponent(productId)}/variants`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        sku: input.sku || undefined,
        barcode: input.barcode || undefined,
        price: String(input.price),
        costPrice: input.costPrice === undefined ? undefined : String(input.costPrice),
        variantCostPrice: input.costPrice === undefined ? undefined : String(input.costPrice),
        variantSellingPrice: String(input.price),
        isActive: input.isActive ?? true,
      }),
    },
  );
  return toVariant(variant);
}

export const createProduct = async (data: CreateProductInput): Promise<Product> => {
  if (API_MODE !== 'mock') {
    const productTypeMap: Record<CreateProductInput['type'], number> = {
      'Finished good': 1,
      'Raw material': 2,
      Service: 3,
      Bundle: 4,
    };
    const productImages = data.images ?? [];
    if (!productImages.length) {
      throw new Error('Add at least one PNG or JPEG product image.');
    }

    const formData = new FormData();
    formData.append('categoryId', data.categoryId);
    if (data.vendorId) formData.append('merchantId', data.vendorId);
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.brandId) formData.append('brandId', data.brandId);
    formData.append('isActive', String(data.status === 'Active'));
    formData.append('baseCostPrice', String(data.cost));
    formData.append('baseSellingPrice', String(data.sellingPrice));
    formData.append('baseUnitOfMeasurement', data.unitOfMeasure);
    formData.append('type', String(productTypeMap[data.type]));
    formData.append('reorderLevel', String(data.reorderLevel));
    formData.append('reorderQuantity', String(data.reorderQuantity));

    await Promise.all(
      productImages.map(async (imageUrl, index) => {
        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();
        const extension = imageBlob.type === 'image/png' ? 'png' : 'jpg';
        formData.append('productImages', imageBlob, `product-image-${index + 1}.${extension}`);
      }),
    );

    const product = await fetchApi<BackendProduct>('/api/v1/products', {
      method: 'POST',
      body: formData,
    });

    if (data.hasVariants && data.variants?.length) {
      await Promise.all(data.variants.map((variant) => fetchApi<BackendVariant>(
        `/api/v1/products/${product.id}/variants`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: variant.name,
            barcode: variant.barcode || undefined,
            price: String(variant.price),
            variantCostPrice: String(variant.cost),
            variantSellingPrice: String(variant.price),
            isActive: variant.isActive,
          }),
        },
      )));
    }

    return getProductById(String(product.id));
  }

  await delay(1000);
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    ...data,
    sku: `PRODUCT-${Date.now()}`,
    price: data.cost,
    variants: data.variants?.map((variant, index) => ({
      ...variant,
      id: `variant-${Date.now()}-${index}`,
      sku: `VAR-${Date.now()}-${index + 1}`,
      images: [],
      stockCount: 0,
    })) ?? [],
    images: data.images ?? [],
    totalStock: 0,
    updatedAt: new Date().toISOString(),
    categoryName: '',
    rating: 0,
    reviewCount: 0,
  };
  MOCK_PRODUCTS.unshift(newProduct);
  return newProduct;
};
