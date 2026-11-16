import { Category } from "../category/types";
import { Merchant } from "../merchants/types";

export type ProductType = 'Finished good' | 'Raw material' | 'Service' | 'Bundle';
export type ProductStatus = 'Draft' | 'Active' | 'Archived';

export interface ProductVariantAttribute {
  name: string;
  type: 'text' | 'colour';
  value: string;
  swatch?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  cost: number;
  price: number;
  reorderLevel: number;
  images: string[];
  isActive: boolean;
  stockCount: number;
  attributes?: ProductVariantAttribute[];
}

export interface PublicVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  isActive: boolean;
  stockStatus: 'In stock' | 'Low stock' | 'Out of stock';
  images: string[];
  attributes?: ProductVariantAttribute[];
}

export interface PublicProduct {
  id: string;
  slug?: string;
  name: string;
  sku: string;
  type: ProductType;
  categoryName: string;
  brand?: string;
  description?: string;
  status: ProductStatus;
  images: string[];
  price: number;
  originalPrice?: number;
  hasVariants: boolean;
  variants: PublicVariant[];
  merchant?: Merchant;
  rating: number;
  reviewCount: number;
  inStock?: boolean;
  stockStatus?: 'In stock' | 'Low stock' | 'Out of stock';
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  sku: string;
  type: ProductType;
  category?: Category;
  categoryName: string;
  brand?: string;
  description?: string;
  unitOfMeasure: string;
  barcode?: string;
  status: ProductStatus;

  images: string[];

  // Pricing (If no variants, this applies to base product)
  price: number;
  sellingPrice: number;
  originalPrice?: number;
  wholesalePrice?: number;
  taxClassId?: string;
  priceIncludesTax: boolean;

  hasVariants: boolean;
  variants: ProductVariant[];

  // Inventory settings
  trackInventory: boolean;
  reorderLevel: number;
  reorderQuantity: number;
  allowBackorder: boolean;

  // Commission
  isCommissionable: boolean;

  // KPIs / Aggregates
  totalStock: number;
  /** Distinct customers currently holding this product in their carts. */
  cartUsersCount?: number;
  /** Distinct orders containing this product. */
  ordersCount?: number;
  updatedAt: string;
  inStock?: boolean;
  totalSold?: number;

  merchant?: Merchant;

  rating: number;
  reviewCount: number;

  attributes?: Array<{
    name: string;
    value: string;
  }>
}
