'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Search, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { AmountText } from '@/components/patterns/AmountText';
import type { ReferralCandidate } from '@/features/checkout/api';
import { SPRING_SNAPPY } from '@/lib/motion';

interface CartSummaryItem {
  id: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

interface CheckoutSummarySidebarProps {
  items: CartSummaryItem[];
  subtotal: number;
  deliveryFee: number;
  shoppingCreditApplied: number;
  checkoutTotal: number;
  referralInput: string;
  onReferralInputChange: (val: string) => void;
  searchResults: ReferralCandidate[];
  selectedReferral: ReferralCandidate | null;
  onSelectReferral: (user: ReferralCandidate | null) => void;
  appliedReferral: { code: string; name: string } | null;
  onApplyReferral: (ref: { code: string; name: string } | null) => void;
  onClearSearchResults: () => void;
}

export function CheckoutSummarySidebar({
  items,
  subtotal,
  deliveryFee,
  shoppingCreditApplied,
  checkoutTotal,
  referralInput,
  onReferralInputChange,
  searchResults,
  selectedReferral,
  onSelectReferral,
  appliedReferral,
  onApplyReferral,
  onClearSearchResults,
}: CheckoutSummarySidebarProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <div className="w-full lg:w-[380px] shrink-0">
      {/* Mobile collapsible summary toggle */}
      <button
        type="button"
        onClick={() => setMobileExpanded((prev) => !prev)}
        className="lg:hidden w-full mb-3 px-4 py-3 rounded-xl border border-border bg-white shadow-sm flex items-center justify-between"
      >
        <span className="text-sm font-semibold text-text flex items-center gap-1.5">
          Order Summary ({items.length})
          {mobileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
        <span className="text-base font-bold text-brand-600 tabular">
          <AmountText amountInKobo={checkoutTotal} />
        </span>
      </button>

      <div className={`${mobileExpanded ? 'block' : 'hidden'} lg:block bg-white rounded-xl border border-border shadow-sm p-6 sticky top-24`}>
        <h2 className="text-lg font-bold text-text mb-4">Summary</h2>

        <div className="max-h-60 overflow-y-auto mb-4 divide-y divide-border pr-2">
          {items.map((item) => (
            <div key={item.id} className="py-3 flex gap-3">
              <div className="w-12 h-12 rounded border border-border shrink-0 overflow-hidden bg-surface-1">
                {item.productImage ? (
                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text line-clamp-1">{item.productName}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-text-muted">Qty: {item.quantity}</span>
                  <span className="text-sm font-bold text-text tabular">
                    <AmountText amountInKobo={item.price * item.quantity} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Referral Section */}
        <div className="mb-6 border-t border-border pt-4">
          <h3 className="text-sm font-semibold mb-2">Referred by someone?</h3>
          {appliedReferral ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING_SNAPPY}
              className="flex items-center justify-between bg-success-light/30 border border-success-main/30 rounded p-3 text-sm"
            >
              <div>
                <span className="text-success-dark font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> Referral applied
                </span>
                <span className="text-success-dark/80 text-xs">Supporting {appliedReferral.name}</span>
              </div>
              <button
                type="button"
                onClick={() => onApplyReferral(null)}
                className="text-success-dark hover:text-success-dark/70 font-medium text-xs"
              >
                Remove
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="enter Aba, Emeka, Sarah"
                  value={referralInput}
                  onChange={(e) => onReferralInputChange(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="absolute top-11 left-0 w-full bg-white border border-border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                  {searchResults.map((u) => (
                    <button
                      type="button"
                      key={u.customerId}
                      className="w-full text-left flex items-center gap-3 p-3 border-b border-border last:border-0 hover:bg-surface-1 cursor-pointer transition-colors"
                      onClick={() => {
                        onSelectReferral(u);
                        onClearSearchResults();
                      }}
                    >
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm text-text truncate">{u.name}</p>
                        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                          <span>{u.username ? `@${u.username}` : 'Customer'}</span>
                          <span>•</span>
                          <span className="font-mono">{u.referralCode}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedReferral && (
                <div className="flex items-center justify-between rounded border border-brand-200 bg-brand-50 p-3 text-sm">
                  <span>Use <strong>{selectedReferral.name}</strong>&apos;s referral code?</span>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => onSelectReferral(null)}>Cancel</Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        onApplyReferral({ code: selectedReferral.referralCode, name: selectedReferral.name });
                        onSelectReferral(null);
                        onReferralInputChange('');
                        onClearSearchResults();
                      }}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              )}
              <p className="text-xs text-text-muted">
                Search by referral code or username, then confirm the customer who referred you.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 text-sm mb-6 border-t border-border pt-4">
          <div className="flex justify-between">
            <span className="text-text-muted">Subtotal</span>
            <span className="font-medium text-text tabular"><AmountText amountInKobo={subtotal} /></span>
          </div>

          <AnimatePresence>
            {shoppingCreditApplied > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-between text-success-dark overflow-hidden"
              >
                <span>Shopping credits</span>
                <span className="font-medium tabular">−<AmountText amountInKobo={shoppingCreditApplied} /></span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between">
            <span className="text-text-muted">Delivery</span>
            <span className="font-medium text-text tabular"><AmountText amountInKobo={deliveryFee} /></span>
          </div>

          <div className="border-t border-border pt-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-text text-base">Total</span>
              <motion.span
                key={checkoutTotal}
                initial={{ scale: 1.06, color: 'var(--brand-700)' }}
                animate={{ scale: 1, color: 'var(--brand-600)' }}
                transition={{ duration: 0.25 }}
                className="font-bold text-xl tabular"
              >
                <AmountText amountInKobo={checkoutTotal} />
              </motion.span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted justify-center bg-surface-1 p-2 rounded">
          <ShieldCheck className="w-4 h-4 text-success-main" />
          <span>SSL Secured Payment</span>
        </div>
      </div>
    </div>
  );
}
