'use client';

import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div
      className="bg-white rounded-xl border border-border overflow-hidden flex flex-col h-full"
      aria-hidden="true"
    >
      <div className="aspect-square w-full animate-shimmer" />
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <div className="h-3 w-20 rounded animate-shimmer" />
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-2/3 rounded animate-shimmer" />
        <div className="h-3 w-16 rounded animate-shimmer mt-1" />
        <div className="mt-auto pt-2 flex justify-between items-center">
          <div className="h-5 w-24 rounded animate-shimmer" />
          <div className="w-8 h-8 rounded-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({
  count = 8,
  className = 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
}: ProductGridSkeletonProps) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
