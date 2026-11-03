'use client';

import { brand } from '@/config/brand';
import { API_MODE, fetchApi } from '@/lib/api';
import { getProducts, toProduct } from '@/features/products/api/products.api';
import { ProductCard } from '@/components/storefront/ProductCard';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export function TrendingProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      if (API_MODE === 'mock') return getProducts();
      const products = await fetchApi<Parameters<typeof toProduct>[0][]>('/api/v1/storefront/trending-products');
      return { data: products.map(toProduct) };
    },
  });

  return (
    <section className="bg-surface-1 py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-brand-900 mb-8 text-center">Trending on {brand.name}</h2>
        {isLoading ? (
          <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data?.data?.slice(1, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
