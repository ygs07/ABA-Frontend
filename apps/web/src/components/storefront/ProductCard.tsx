'use client';
import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { AmountText } from '@/components/patterns/AmountText';
import { AddToCartButton } from '@/components/storefront/AddToCartButton';
import { Product } from '@/features/products/types';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const merchantName = product.merchant?.name || 'Nigerian Merchant';
  const price = product.price ?? 0;

  return (
    <Link href={`/products/${product.slug || product.id}`} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-sm transition-shadow group flex flex-col h-full relative">
      <div className="aspect-square bg-surface-2 relative overflow-hidden flex items-center justify-center group-hover:bg-surface-1 transition-colors duration-500">
        {(product.images && product.images.length > 0) ? (
          <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
        ) : (
          <span className="text-brand-600 font-bold opacity-30">Image</span>
        )}
        {product.originalPrice && product.originalPrice > price && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-error text-white text-[10px] font-bold rounded shadow-sm z-10">
            -{Math.round((1 - price / product.originalPrice) * 100)}%
          </div>
        )}
        
        {/* Quick View Button */}
        {onQuickView && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button 
              className="bg-white text-text px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-brand-50 hover:text-brand-600 transition-colors z-20 translate-y-4 group-hover:translate-y-0 duration-300"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
            >
              Quick View
            </button>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-text-muted mb-1">{merchantName}</p>
        <h3 className="font-medium text-text mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">{product.name}</h3>
        {product.reviewCount > 0 ? <div className="flex items-center gap-1 mb-3"><Star className="w-4 h-4 text-warning-main fill-warning-main" /><span className="text-sm font-medium">{product.rating.toFixed(1)}</span><span className="text-xs text-text-muted">({product.reviewCount})</span></div> : <p className="mb-3 text-xs text-text-muted">No reviews yet</p>}
        <div className="mt-auto flex justify-between items-end">
          <div>
            {product.originalPrice && product.originalPrice > price ? (
              <>
                <p className="text-xs text-text-subtle line-through"><AmountText amountInKobo={product.originalPrice} /></p>
                <p className="text-lg font-bold text-text"><AmountText amountInKobo={price} /></p>
              </>
            ) : (
              <p className="text-lg font-bold text-text"><AmountText amountInKobo={price} /></p>
            )}
          </div>
          <div onClick={(e) => {
            // Prevents the Link navigation when clicking the add to cart button
            e.preventDefault();
            e.stopPropagation();
          }}>
            <AddToCartButton product={product} variant="icon" className="relative z-10" />
          </div>
        </div>
      </div>
    </Link>
  );
}
