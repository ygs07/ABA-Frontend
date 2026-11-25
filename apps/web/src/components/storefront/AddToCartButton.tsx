'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/features/cart/store';
import { CartItem } from '@/features/cart/types';
import { Check, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SPRING_SNAPPY } from '@/lib/motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';
import { usePathname, useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  product: any;
  variant?: 'default' | 'icon';
  className?: string;
  quantity?: number;
  disabled?: boolean;
}

export function AddToCartButton({ product, variant = 'default', className = '', quantity = 1, disabled = false }: AddToCartButtonProps) {
  const { addToCart, isSyncing } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const isCustomer = useAuthStore((state) =>
    Boolean(state.isAuthenticated && (state.user?.userType === 'Customer' || state.user?.roles.includes('Customer'))),
  );
  const [loading, setLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1400);
    return () => window.clearTimeout(timer);
  }, [justAdded]);
  const selectedVariant = product.variants?.find((item: { isActive?: boolean; stockCount?: number }) =>
    item.isActive && (item.stockCount ?? 0) > 0,
  ) ?? product.variants?.[0];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCustomer) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setLoading(true);

    if (!selectedVariant?.id && product.variants?.length) {
      toast.error('This product does not have a purchasable variant yet.');
      setLoading(false);
      return;
    }

    const cartItem: Omit<CartItem, 'id'> = {
      productId: product.id || product.slug, // fallback if ID varies
      productVariantId: selectedVariant?.id,
      productName: product.name,
      productImage: product.image || (product.images?.[0] ?? ''),
      merchantId: product.merchantId || 'unknown',
      merchantName: product.merchantName || 'Unknown Merchant',
      price: selectedVariant?.price || product.price || product.sellingPrice || 0,
      quantity,
    };

    await addToCart(cartItem);
    toast.success(`${product.name} added to cart!`);
    setLoading(false);
    setJustAdded(true);
  };

  if (variant === 'icon') {
    return (
      <Button
        size="sm"
        className={`rounded-full w-8 h-8 p-0 flex items-center justify-center hover:scale-110 active:scale-95 hover:bg-brand-700 transition-all ${justAdded ? 'bg-success hover:bg-success text-white' : ''} ${className}`}
        onClick={handleAddToCart}
        disabled={disabled || loading || (selectedVariant ? selectedVariant.stockCount < quantity : product.totalStock < quantity)}
      >
        <span className="sr-only">Add to cart</span>
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span key="loading" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={SPRING_SNAPPY}>
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.span>
          ) : justAdded ? (
            <motion.span key="added" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={SPRING_SNAPPY}>
              <Check className="w-4 h-4" />
            </motion.span>
          ) : (
            <motion.span key="plus" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={SPRING_SNAPPY}>
              +
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className={`text-base font-semibold bg-linear-to-r ${justAdded ? 'from-success to-emerald-600' : 'from-orange-500 to-amber-500'} text-white active:scale-[0.98] transition-all ${className}`}
      disabled={disabled || loading || (selectedVariant ? selectedVariant.stockCount < quantity : product.totalStock < quantity)}
      onClick={handleAddToCart}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span key="loading" className="inline-flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Adding...
          </motion.span>
        ) : justAdded ? (
          <motion.span key="added" className="inline-flex items-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={SPRING_SNAPPY}>
            <Check className="w-5 h-5 mr-2" />
            Added!
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Add to Cart
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
