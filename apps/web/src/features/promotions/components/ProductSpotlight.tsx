'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/button';
import { mockShopProducts } from '@/features/shop/mocks';
import { API_MODE, fetchApi } from '@/lib/api';
import { toProduct } from '@/features/products/api/products.api';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export function ProductSpotlight() {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      if (API_MODE === 'mock') return mockShopProducts.slice(0, 4);
      const products = await fetchApi<Parameters<typeof toProduct>[0][]>(
        '/api/v1/storefront/featured-products',
      );
      return products.map(toProduct);
    },
  });

  if (!isLoading && featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-surface">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text">Featured Products</h2>
            <p className="text-text-muted mt-1">Discover top picks sponsored by our merchants</p>
          </div>
          <Link href="/shop" className="hidden md:block">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/shop">
            <Button variant="outline" className="w-full">View All Products</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
