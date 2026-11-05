'use client';
import React, { useState } from 'react';
import { Star, Heart, ShieldCheck, Truck, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AmountText } from '@/components/patterns/AmountText';
import { AddToCartButton } from '@/components/storefront/AddToCartButton';
import { ProductOptions } from './ProductOptions';
import { ProductVariant, Product } from '@/features/products/types';
import { ShareMenu } from '@/components/patterns/ShareMenu';
import { cn } from '@/lib/utils';
import { brand } from '@/config/brand';
import { useAuthStore } from '@/features/auth/store';
import { useCartStore } from '@/features/cart/store';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProductBuyBoxProps {
  product: Product;
  selectedVariant: ProductVariant | undefined;
  setSelectedVariant: (variant: ProductVariant) => void;
}

export function ProductBuyBox({ product, selectedVariant, setSelectedVariant }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const pathname = usePathname();
  const addToCart = useCartStore((state) => state.addToCart);
  const isCustomer = useAuthStore((state) =>
    Boolean(state.isAuthenticated && (state.user?.userType === 'Customer' || state.user?.roles.includes('Customer'))),
  );
  
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeStock = selectedVariant ? selectedVariant.stockCount : product.totalStock;
  const inStock = activeStock > 0;

  const buyNow = async () => {
    if (!isCustomer) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if ((selectedVariant && selectedVariant.stockCount < quantity) || (!selectedVariant && product.variants.length > 0) || (!selectedVariant && product.totalStock < quantity)) {
      toast.error('The selected variant is unavailable in the requested quantity.');
      return;
    }
    await addToCart({
      productId: product.id,
      productVariantId: selectedVariant?.id,
      productName: product.name,
      productImage: product.images[0] ?? '',
      merchantId: product.merchant?.id ?? '',
      merchantName: product.merchant?.name ?? 'Merchant',
      price: selectedVariant?.price ?? product.price,
      quantity,
    });
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col lg:sticky lg:top-40 bg-surface rounded-2xl p-6 lg:border lg:border-border lg:shadow-sm">
      {/* 1. Title */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <h1 className="text-2xl font-bold text-text tracking-tight">{product.name}</h1>
        <ShareMenu 
          url={`/products/${product.id}${selectedVariant ? `?color=${selectedVariant.attributes?.find(a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colour')?.value}` : ''}`}
          title={product.name} text={''} 
        />
      </div>

      {/* Reviews & Rating Summary */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-warning-main fill-warning-main" />
          <span className="text-sm font-medium text-text">{product.rating}</span>
        </div>
        <span className="text-text-muted">&middot;</span>
        <a href="#reviews" className="text-sm text-brand-600 hover:underline">
          {product.reviewCount} Reviews
        </a>
      </div>

      {/* 2. Seller Info */}
      <div className="flex items-center gap-3 py-4 border-y border-border mb-6">
        <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center overflow-hidden shrink-0">
          <Store className="w-5 h-5 text-text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text truncate">
            {product.merchant?.name || 'Unknown Seller'}
          </div>
          <div className="text-xs text-text-muted mt-0.5 truncate flex items-center gap-1">
            <span>99.9% positive</span>
            <span>&middot;</span>
            <a 
              href="#reviews"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="underline hover:text-brand-600 cursor-pointer"
            >
              Seller details
            </a>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full text-xs shrink-0">
          Message
        </Button>
      </div>

      {/* 3. Price */}
      <div className="mb-6">
        <div className="flex items-end gap-3 mb-1">
          <span className="text-3xl font-bold text-text"><AmountText amountInKobo={activePrice} /></span>
          {product.originalPrice && product.originalPrice > activePrice && (
            <>
              <span className="text-lg text-text-subtle line-through mb-1"><AmountText amountInKobo={product.originalPrice} /></span>
              <span className="text-sm font-bold text-error bg-error/10 px-2 py-1 rounded mb-1">
                -{Math.round((1 - activePrice / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-text-muted">Prices include VAT.</p>
      </div>

      {/* Condition / Quick specs if any */}
      <div className="flex gap-4 text-sm mb-6 pb-6 border-b border-border">
        <span className="text-text-muted w-20">Condition:</span>
        <div className="font-medium text-text">
          New <span className="text-text-muted font-normal italic ml-1">"Brand new, sealed"</span>
        </div>
      </div>

      {/* 4. Product Options */}
      <div className="mb-6">
        <ProductOptions 
          variants={product.variants || []} 
          selectedVariant={selectedVariant}
          onVariantSelect={setSelectedVariant}
        />
      </div>

      {/* 5. Quantity */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-text-muted w-20">Quantity:</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-lg bg-surface-1 h-10 w-28 shrink-0">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 h-full hover:text-brand-600 transition-colors">-</button>
            <span className="flex-1 text-center font-medium text-sm">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(activeStock || 99, quantity + 1))} className="flex-1 h-full hover:text-brand-600 transition-colors">+</button>
          </div>
          <div className="text-sm text-text-muted flex items-center gap-2">
            <span className={inStock ? "text-success-dark" : "text-error-dark"}>
              {inStock ? `${activeStock} available` : 'Out of Stock'}
            </span>
            {inStock && product.totalSold && product.totalSold > 0 && (
              <>
                <span>&middot;</span>
                <span className="font-medium text-error-main">{product.totalSold} sold</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 6. Actions */}
      <div className="flex flex-col gap-3 mb-6">
        <Button variant="primary" size="lg" className="w-full text-base font-semibold" onClick={buyNow} disabled={!inStock || quantity > activeStock}>
          Buy It Now
        </Button>
        <AddToCartButton product={product} quantity={quantity} />
        <Button variant="outline" size="lg" className="w-full h-12 mt-1 border-brand-200 text-brand-700 hover:bg-brand-50">
          <Heart className="w-4 h-4 mr-2" /> Add to Watchlist
        </Button>
      </div>

      {/* 7. Highlights */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 mb-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 shrink-0 flex items-center justify-center mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <span className="text-sm text-text"><strong className="font-medium">Breathe easy.</strong> Returns accepted.</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 shrink-0 flex items-center justify-center mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
          </div>
          <span className="text-sm text-text"><strong className="font-medium">People want this.</strong> Over 20 people have this in their cart.</span>
        </div>
      </div>

      {/* 8. Shipping & Returns info */}
      <div className="mb-6 pt-2 border-t border-border">
        <h3 className="font-bold text-text mb-4">Shipping, returns, and payments</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-4">
            <span className="text-text-muted w-20 shrink-0">Shipping:</span>
            <div className="text-text">
              Delivery calculated at checkout.{' '}
              <a 
                href="#delivery" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  const btn = document.getElementById('delivery-tab-btn'); 
                  if(btn) { 
                    btn.click(); 
                    btn.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
                  } 
                }} 
                className="underline cursor-pointer hover:text-brand-600"
              >
                See details
              </a>
              <div className="text-text-muted mt-1">Located in: Lagos, Nigeria</div>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-text-muted w-20 shrink-0">Delivery:</span>
            <span className="text-text">Estimated between 2-5 working days.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-text-muted w-20 shrink-0">Returns:</span>
            <div className="text-text">
              14 days returns. Buyer pays for return shipping.{' '}
              <a 
                href="#delivery" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  const btn = document.getElementById('delivery-tab-btn'); 
                  if(btn) { 
                    btn.click(); 
                    btn.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
                  } 
                }} 
                className="underline cursor-pointer hover:text-brand-600"
              >
                See details
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-text-muted w-20 shrink-0">Payments:</span>
            <div className="flex items-center gap-2">
              {/* Payment Icons */}
              <div className="px-2 py-0.5 border border-border rounded bg-white text-xs font-bold text-blue-800">Paystack</div>
              <div className="px-2 py-0.5 border border-border rounded bg-white text-xs font-bold text-brand-600">Cards</div>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Guarantees */}
      <div className="pt-6 border-t border-border">
        <h3 className="font-bold text-text mb-4">Shop with confidence</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-brand-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-text">{brand.name} Buyer Protection</p>
              <p className="text-sm text-text-muted mt-0.5">Get the item you ordered or get your money back. <a href="#" className="underline">Learn more</a></p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="w-6 h-6 text-text shrink-0" />
            <div>
              <p className="text-sm font-bold text-text">Trusted Logistics</p>
              <p className="text-sm text-text-muted mt-0.5">Fast shipping and tracking provided for all orders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
