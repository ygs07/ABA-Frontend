'use client';

import { useState } from 'react';
import { ShoppingCart, ExternalLink, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Product } from '@/features/products/types';
import { AmountText } from '@/components/patterns/AmountText';
import Link from 'next/link';
import { useCartStore } from '@/features/cart/store';
import { CartItem } from '@/features/cart/types';
import { toast } from 'sonner';

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickViewModal({ product, isOpen, onClose }: ProductQuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { addToCart, isSyncing } = useCartStore();
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : ['https://placehold.co/400x400?text=No+Image'];

  const increase = () => setQuantity(q => q + 1);
  const decrease = () => setQuantity(q => (q > 1 ? q - 1 : 1));


  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const cartItem: Omit<CartItem, 'id'> = {
      productId: product.id || product.slug!,
      productName: product.name,
      productImage: (product.images?.[0] ?? ''),
      merchantId: product.merchant?.id || 'unknown',
      merchantName: product.merchant?.name || 'Unknown Merchant',
      price: product.price || product.sellingPrice || 0,
      quantity,
    };

    await addToCart(cartItem);
    toast.success(`${product.name} added to cart!`);
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-left mb-2">
          <DialogTitle>Quick View</DialogTitle>
          <DialogDescription className="hidden">Product Quick View</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-2">
            <div className="aspect-square bg-surface-2 rounded-lg overflow-hidden border border-border">
              <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-md border-2 overflow-hidden flex-shrink-0 ${activeImage === idx ? 'border-brand-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h2 className="text-xl font-semibold text-text mb-2">{product.name}</h2>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-brand-700"><AmountText amountInKobo={product.price} /></span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-text-muted line-through">₦{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-sm text-text-muted mb-4 line-clamp-3">
              {product.description || 'No description available for this product.'}
            </p>

            {/* Variants / Color Placeholders */}
            {product.hasVariants && (
              <div className="mb-4">
                <span className="text-sm font-medium block mb-2">Options</span>
                <div className="flex gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white ring-2 ring-slate-800"></span>
                  <span className="w-8 h-8 rounded-full bg-red-800 border-2 border-transparent"></span>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <span className="text-sm font-medium block mb-2">Quantity</span>
              <div className="flex items-center">
                <Button variant="outline" size="icon" onClick={decrease} disabled={quantity <= 1} className="h-9 w-9 rounded-r-none">
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="h-9 px-4 flex items-center justify-center border-y border-border text-sm font-medium min-w-[3rem]">
                  {quantity}
                </div>
                <Button variant="outline" size="icon" onClick={increase} className="h-9 w-9 rounded-l-none">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button disabled={loading} onClick={handleAddToCart} className="w-full bg-brand-600 hover:bg-brand-700">
                <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/products/${product.slug || product.id}`}>
                  View full details <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
