'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MapPin, Phone, Mail, Loader2, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getStorefrontMerchantById } from '@/features/merchant/api';
import { getShopProducts } from '@/features/shop/api';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ErrorState } from '@/components/patterns/ErrorState';
import { Product } from '@/features/products/types';
import { SellerCredibilityPanel } from '../_components/SellerCredibilityPanel';
import { StoreFilterBar } from '../_components/StoreFilterBar';
import { StoreCategoryMenu } from '../_components/StoreCategoryMenu';
import { ProductQuickViewModal } from '../_components/ProductQuickViewModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MerchantHeader } from '../_components/MerchantHeader';
import { ReviewList } from '@/features/reviews';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store';

function MerchantProfileContent({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const merchantId = unwrappedParams.id;
  
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const sort = (searchParams.get('sort') as any) || 'recommended';
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const onSaleOnly = searchParams.get('onSaleOnly') === 'true';
  const categorySlug = searchParams.get('category') || undefined;

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const isCustomer = useAuthStore((state) =>
    Boolean(state.isAuthenticated && (state.user?.userType === 'Customer' || state.user?.roles.includes('Customer'))),
  );

  const { data: merchant, isLoading: isMerchantLoading, error: merchantError } = useQuery({
    queryKey: ['merchant', merchantId],
    queryFn: async () => {
      const res = await getStorefrontMerchantById(merchantId);
      return res.data;
    }
  });

  // Query all merchant products (unfiltered) for the category tree
  const { data: allProducts = [] } = useQuery({
    queryKey: ['merchant_products_all', merchantId],
    queryFn: async () => {
      const res = await getShopProducts({ merchantId: merchant?.id || merchantId });
      return res.data;
    },
    enabled: !!merchant
  });

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['merchant_products_filtered', merchantId, q, sort, minRating, inStockOnly, onSaleOnly, categorySlug],
    queryFn: async () => {
      const res = await getShopProducts({ 
        merchantId: merchant?.id || merchantId,
        q,
        sort,
        minRating,
        inStockOnly,
        onSaleOnly,
        categorySlug
      });
      return res.data;
    },
    enabled: !!merchant
  });

  if (isMerchantLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (merchantError || !merchant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorState
          title={merchantError?.message || 'Merchant not found'}
          description="We couldn't load the requested merchant details. Please try again."
        />
      </div>
    );
  }

  if (merchant.status === 'Suspended') {
    return (
      <div className="bg-surface-1 min-h-screen pb-16">
        <MerchantHeader merchant={merchant} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-error/10 border border-error text-error p-4 rounded-lg text-center font-medium">
            This store is currently suspended and its products are unavailable.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 min-h-screen pb-16 pt-16 md:pt-24">
      <MerchantHeader merchant={merchant} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="shop" className="w-full">
          <TabsList className="mb-6 h-12 bg-white border border-border">
            <TabsTrigger value="shop" className="text-base px-6">Shop</TabsTrigger>
            <TabsTrigger value="about" className="text-base px-6">About</TabsTrigger>
            <TabsTrigger value="feedback" className="text-base px-6">Feedback</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shop" className="mt-0 outline-none">
            <StoreFilterBar products={allProducts} />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar: Categories & Credibility */}
              <div className="hidden lg:block lg:col-span-1 space-y-6">
                <StoreCategoryMenu products={allProducts} />
                <SellerCredibilityPanel merchant={merchant} />
              </div>

              {/* Main Products Area */}
              <div className="lg:col-span-3">
                {isProductsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {products?.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onQuickView={setQuickViewProduct}
                      />
                    ))}

                    {(!products || products.length === 0) && (
                      <div className="col-span-full py-16 text-center bg-white border-2 border-dashed border-border rounded-xl">
                        <div className="text-text font-medium mb-1">No products found</div>
                        <div className="text-text-muted text-sm">Try adjusting your filters or search term.</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                  <h3 className="font-semibold text-text mb-4 text-lg">About the Store</h3>
                  <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
                    {merchant.description || 'Welcome to our store. Check out our latest products!'}
                  </p>
                </div>
              </div>
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                  <h3 className="font-semibold text-text mb-4">Contact Information</h3>
                  <div className="space-y-4 text-sm text-text-muted">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                      <span>{merchant.address}<br/>{merchant.city}, {merchant.state}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>{merchant.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>{merchant.email}</span>
                    </div>
                    {merchant.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-brand-600 shrink-0" />
                        <Link href={merchant.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                          {merchant.website}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-brand-50 rounded-xl border border-brand-100 p-6 shadow-sm">
                  <h3 className="font-semibold text-brand-900 mb-2">Referral Network</h3>
                  <p className="text-sm text-brand-800 mb-4">
                    This merchant is part of the Aba Online referral network. You can earn commissions by referring their products!
                  </p>
                  <Button size="sm" variant="outline" className="w-full bg-white border-brand-200 text-brand-700 hover:bg-brand-100">
                    Join their network
                  </Button>
                </div>

                <div className="md:hidden">
                  <SellerCredibilityPanel merchant={merchant} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="mt-0 outline-none">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-text mb-2">Seller feedback <span className="text-text-muted font-normal">({merchant.rating || '2,855'})</span></h2>
              
              <div className="mt-8">
                <ReviewList 
                  productId={merchantId} 
                  isEligibleToReview={isCustomer}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ProductQuickViewModal 
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default function MerchantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <React.Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>}>
      <MerchantProfileContent params={params} />
    </React.Suspense>
  );
}
