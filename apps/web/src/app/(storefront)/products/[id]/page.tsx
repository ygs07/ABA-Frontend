'use client';
import { brand } from '@/config/brand';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProductDetailBySlug, getRelatedProducts, getMerchantProducts } from '@/features/product/api';
import { ErrorState } from '@/components/patterns/ErrorState';
import { ProductGallery } from '../_components/ProductGallery';
import { RelatedProductsRail } from '../_components/RelatedProductsRail';
import { ProductVariant } from '@/features/products/types';
import { AboutSellerTab } from '../_components/AboutSellerTab';
import { ProductInfoTabs } from '../_components/ProductInfoTabs';
import { ProductBuyBox } from '../_components/ProductBuyBox';
import { useAuthStore } from '@/features/auth/store';

export default function ProductDetailPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ color?: string }>
}) {
  const unwrappedParams = React.use(params);
  const unwrappedSearchParams = React.use(searchParams);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const isCustomer = useAuthStore((state) =>
    Boolean(state.isAuthenticated && (state.user?.userType === 'Customer' || state.user?.roles.includes('Customer'))),
  );

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product_detail', unwrappedParams.id],
    queryFn: async () => {
      const res = await getProductDetailBySlug(unwrappedParams.id);
      return res.data;
    }
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['product_related', product?.category?.id, product?.id],
    queryFn: async () => {
      if (!product?.category?.id) return [];
      const res = await getRelatedProducts(product.category.id, product.id);
      return res.data;
    },
    enabled: !!product?.category?.id
  });

  const { data: merchantProducts } = useQuery({
    queryKey: ['product_merchant', product?.merchant?.id, product?.id],
    queryFn: async () => {
      if (!product?.merchant?.id) return [];
      const res = await getMerchantProducts(product.merchant.id, product.id);
      return res.data;
    },
    enabled: !!product?.merchant?.id
  });

  // Set initial variant based on URL color
  useEffect(() => {
    if (product?.variants?.length) {
      const urlColor = unwrappedSearchParams.color;
      if (urlColor) {
        const matched = product.variants.find(v => 
          v.attributes?.some(a => (a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colour') && a.value.toLowerCase() === urlColor.toLowerCase())
        );
        if (matched) {
          setSelectedVariant(matched);
          return;
        }
      }
      
      // Default to first in-stock variant
      const firstInStock = product.variants.find(v => v.stockCount > 0 && v.isActive);
      setSelectedVariant(firstInStock || product.variants[0]);
    }
  }, [product, unwrappedSearchParams.color]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorState
          title={error?.message || 'Product not found'}
          description="We couldn't load the requested product details. Please try again."
        />
      </div>
    );
  }
  
  // Collect images from base product + selected variant
  let displayImages = [...(product.images || [])];
  if (selectedVariant?.images?.length) {
    displayImages = [...selectedVariant.images, ...displayImages];
  }
  // Deduplicate images
  displayImages = Array.from(new Set(displayImages));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      {/* Breadcrumbs */}
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href={`/category/${product.category?.id || 'all'}`} className="hover:text-brand-600">{product.categoryName}</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-text line-clamp-1 max-w-sm inline-block align-bottom">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative items-start">
        {/* Left: Gallery & Content */}
        <div className="flex flex-col gap-12 min-w-0">
          <ProductGallery images={displayImages} productName={product.name} />

          {/* Description / Spec Tabs */}
          <ProductInfoTabs product={product} />
        </div>

        {/* Right: Buy Box */}
        <ProductBuyBox 
          product={product} 
          selectedVariant={selectedVariant} 
          setSelectedVariant={setSelectedVariant} 
        />
      </div>

      {/* Rails */}
      <div className="mt-12 lg:mt-24 space-y-8">
        {merchantProducts && merchantProducts.length > 0 && (
          <RelatedProductsRail title="More from this seller" products={merchantProducts as any[]} />
        )}
        
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedProductsRail title="Related items" products={relatedProducts as any[]} />
        )}
      </div>
      
      {/* About Seller & Reviews */}
      <div id="reviews" className="mt-16 pt-8 border-t border-border">
        {product.merchant && (
          <AboutSellerTab merchant={product.merchant} productId={product.id} isEligibleToReview={isCustomer} />
        )}
      </div>
    </div>
  );
}
