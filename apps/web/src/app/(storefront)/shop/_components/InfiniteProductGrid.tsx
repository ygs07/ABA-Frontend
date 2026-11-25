'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductGridSkeleton } from '@/components/storefront/ProductCardSkeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Product } from '@/features/products/types';
import { MOTION_EASE } from '@/lib/motion';

const BATCH_SIZE = 12;

interface InfiniteProductGridProps {
  products: Product[];
  isLoading: boolean;
  filterKey: string;
  onQuickView: (product: Product) => void;
  onClearAll: () => void;
}

export function InfiniteProductGrid({
  products,
  isLoading,
  filterKey,
  onQuickView,
  onClearAll,
}: InfiniteProductGridProps) {
  const storageKey = `shop_scroll:${filterKey}`;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const restoredScrollRef = useRef(false);

  const [visibleCount, setVisibleCount] = useState<number>(() => {
    if (typeof window === 'undefined') return BATCH_SIZE;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { count?: number };
        if (parsed.count && parsed.count >= BATCH_SIZE) {
          return parsed.count;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return BATCH_SIZE;
  });

  const [isAppending, setIsAppending] = useState(false);

  // Restore scroll position on mount when returning from a product page
  useEffect(() => {
    if (restoredScrollRef.current) return;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { scrollY?: number };
        if (typeof parsed.scrollY === 'number' && parsed.scrollY > 0) {
          const targetY = parsed.scrollY;
          requestAnimationFrame(() => {
            window.scrollTo({ top: targetY, behavior: 'auto' });
            restoredScrollRef.current = true;
          });
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  // Persist scroll depth & visible batch count for back-navigation
  useEffect(() => {
    const saveState = () => {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ count: visibleCount, scrollY: window.scrollY }),
        );
      } catch {
        // Ignore storage errors
      }
    };

    window.addEventListener('scroll', saveState, { passive: true });
    return () => {
      saveState();
      window.removeEventListener('scroll', saveState);
    };
  }, [storageKey, visibleCount]);

  const hasMore = visibleCount < products.length;

  const loadNextBatch = React.useCallback(() => {
    if (!hasMore || isAppending) return;
    setIsAppending(true);
    window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, products.length));
      setIsAppending(false);
    }, 180);
  }, [hasMore, isAppending, products.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextBatch();
        }
      },
      { rootMargin: '280px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNextBatch]);

  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found matching your filters."
        description="Try adjusting your search or clearing your active filters."
        actionLabel="Clear Filters"
        onAction={onClearAll}
      />
    );
  }

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              ease: MOTION_EASE,
              delay: (index % BATCH_SIZE) * 0.03,
            }}
          >
            <ProductCard product={product} onQuickView={onQuickView} />
          </motion.div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {isAppending ? (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Loading more products...</span>
            </div>
          ) : (
            <div className="h-4" aria-hidden="true" />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 pt-2 pb-4 text-center">
          <p className="text-xs text-text-muted">
            You&apos;ve reached the end of all{' '}
            <span className="font-semibold text-text">{products.length}</span> products.
          </p>
        </div>
      )}
    </div>
  );
}
