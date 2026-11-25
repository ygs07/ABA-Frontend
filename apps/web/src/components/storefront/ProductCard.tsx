'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Star } from 'lucide-react';
import { motion } from 'motion/react';
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
  const images = product.images ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const displayedIndex =
    isHovered && images.length > 1 && activeIndex === 0 ? 1 : activeIndex;

  return (
    <Link
      href={`/products/${product.slug || product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveIndex(0);
      }}
      className="bg-white rounded-xl border border-border overflow-hidden hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col h-full relative"
    >
      <div className="aspect-square bg-surface-2 relative overflow-hidden flex items-center justify-center">
        {images.length > 0 ? (
          <motion.img
            key={images[displayedIndex]}
            src={images[displayedIndex]}
            alt={product.name}
            initial={{ opacity: 0.75 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-brand-600 font-bold opacity-30">Image</span>
        )}

        {product.originalPrice && product.originalPrice > price && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-error text-white text-[10px] font-bold rounded shadow-sm z-10">
            -{Math.round((1 - price / product.originalPrice) * 100)}%
          </div>
        )}

        {/* Alibaba-style multi-image preview dots */}
        {images.length > 1 && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/35 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {images.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`View image ${idx + 1}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  displayedIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}

        {/* Quick View Button */}
        {onQuickView && (
          <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              className="pointer-events-auto bg-white/95 backdrop-blur-xs text-text px-4 py-2 rounded-full text-xs font-semibold shadow-md hover:bg-brand-50 hover:text-brand-700 transition-all z-20 translate-y-3 group-hover:translate-y-0 duration-300 flex items-center gap-1.5"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-text-muted mb-1 truncate">{merchantName}</p>
        <h3 className="font-medium text-text mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>
        {product.reviewCount > 0 ? (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 text-warning-main fill-warning-main" />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-text-muted">({product.reviewCount})</span>
          </div>
        ) : (
          <p className="mb-3 text-xs text-text-muted">No reviews yet</p>
        )}

        <div className="mt-auto flex justify-between items-end">
          <div>
            {product.originalPrice && product.originalPrice > price ? (
              <>
                <p className="text-xs text-text-subtle line-through">
                  <AmountText amountInKobo={product.originalPrice} />
                </p>
                <p className="text-lg font-bold text-text">
                  <AmountText amountInKobo={price} />
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-text">
                <AmountText amountInKobo={price} />
              </p>
            )}
          </div>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <AddToCartButton product={product} variant="icon" className="relative z-10" />
          </div>
        </div>
      </div>
    </Link>
  );
}
