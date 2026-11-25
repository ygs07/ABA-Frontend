'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AmountText } from '@/components/patterns/AmountText';
import { useCartStore } from '@/features/cart/store';
import { getCartAvailability } from '@/features/cart/api';
import { MOTION_EASE } from '@/lib/motion';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter();
  const [validating, setValidating] = useState(false);
  const { items, subtotal, updateQuantity, removeFromCart, isSyncing } =
    useCartStore();
  const totalItems = useCartStore((state) => state.getTotalItems());

  const handleCheckout = async () => {
    setValidating(true);
    try {
      const availability = await getCartAvailability();
      if (!availability.is_available) {
        const badItem = availability.items.find((i) => !i.is_available);
        toast.error(
          badItem
            ? `Only ${badItem.available_quantity} item(s) available for one of your cart items.`
            : 'One or more cart items are unavailable.',
        );
        return;
      }
      onOpenChange(false);
      router.push('/checkout');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to validate cart availability.',
      );
    } finally {
      setValidating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base font-bold">
            <ShoppingBag className="w-4 h-4 text-brand-600" />
            Shopping Bag ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-text-muted opacity-50" />
            </div>
            <p className="font-semibold text-text mb-1">Your bag is empty</p>
            <p className="text-xs text-text-muted mb-6">
              Explore Made-in-Nigeria products and add items to your bag.
            </p>
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                router.push('/shop');
              }}
              className="rounded-full px-6"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-3">
              <ul className="divide-y divide-border">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24, height: 0 }}
                      transition={{ duration: 0.22, ease: MOTION_EASE }}
                      className="py-3.5 flex gap-3.5"
                    >
                      <div className="w-16 h-16 shrink-0 rounded-lg border border-border overflow-hidden bg-surface-2">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-text-muted truncate">
                              {item.merchantName}
                            </p>
                            <p className="text-sm font-medium text-text truncate">
                              {item.productName}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${item.productName}`}
                            onClick={() => removeFromCart(item.id)}
                            disabled={isSyncing}
                            className="text-text-subtle hover:text-error transition-colors p-1 -mr-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded-md h-7 w-20 bg-surface-2 overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, Math.max(1, item.quantity - 1))
                              }
                              disabled={isSyncing || item.quantity <= 1}
                              className="flex-1 h-full text-sm hover:bg-white disabled:opacity-40"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center text-xs font-semibold tabular">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isSyncing}
                              className="flex-1 h-full text-sm hover:bg-white disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-bold text-text tabular">
                            <AmountText amountInKobo={item.price * item.quantity} />
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            <div className="border-t border-border p-5 bg-surface-2/60 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-lg font-bold text-text tabular">
                  <AmountText amountInKobo={subtotal} />
                </span>
              </div>
              <p className="text-[11px] text-text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
                Shipping &amp; shopping credits calculated at checkout
              </p>
              <Button
                type="button"
                size="lg"
                onClick={handleCheckout}
                disabled={validating || isSyncing}
                className="w-full rounded-full font-semibold"
              >
                {validating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Checking availability...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Link
                href="/cart"
                onClick={() => onOpenChange(false)}
                className="block text-center text-xs font-semibold text-brand-600 hover:underline pt-1"
              >
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
