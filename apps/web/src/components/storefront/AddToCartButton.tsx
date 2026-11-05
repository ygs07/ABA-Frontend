'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/features/cart/store';
import { CartItem } from '@/features/cart/types';
import { Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = React.useState(false);
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
  };

  if (variant === 'icon') {
    return (
      <Button 
        size="sm" 
        className={`rounded-full w-8 h-8 p-0 flex items-center justify-center hover:scale-110 hover:bg-brand-700 transition-transform ${className}`}
        onClick={handleAddToCart}
        disabled={disabled || loading || (selectedVariant ? selectedVariant.stockCount < quantity : product.totalStock < quantity)}
      >
        <span className="sr-only">Add to cart</span>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '+'}
      </Button>
    );
  }

  return (
    <Button 
      size="lg" 
      className={`flex-1 h-12 text-base font-semibold ${className}`} 
      disabled={disabled || loading || (selectedVariant ? selectedVariant.stockCount < quantity : product.totalStock < quantity)}
      onClick={handleAddToCart}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
      {loading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
