import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Store, MessageCircle, Heart, Star, CheckCircle2 } from 'lucide-react';
import { Merchant } from '@/features/merchants/types';
import { ReviewList } from '@/features/reviews';

interface AboutSellerTabProps {
  merchant: Merchant;
  productId: string;
  isEligibleToReview: boolean;
}

export function AboutSellerTab({ merchant, productId, isEligibleToReview }: AboutSellerTabProps) {

  const getWhatsAppLink = (phoneNumber: string | number, name: string) => {
    const cleanedNumber = String(phoneNumber).replace(/\D/g, "");

    // Convert Nigerian local numbers to international format
    const formattedNumber = cleanedNumber.startsWith("0")
      ? `234${cleanedNumber.slice(1)}`
      : cleanedNumber;

    const message = `Hello ${name}, I'm interested in your products`;

    return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-8 animate-in fade-in">
      {/* Left Column: About Seller */}
      <div className="md:col-span-4 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text mb-6">About this seller</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center overflow-hidden shrink-0">
              {merchant.logoUrl ? (
                <img src={merchant.logoUrl} alt={merchant.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-text-muted" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-text">{merchant.name}</h3>
              <p className="text-sm text-text-muted mt-1">99.9% positive feedback &middot; 5.7K items sold</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Calendar className="w-4 h-4" />
            <span>Joined Oct 2025</span>
          </div>

          <div className="flex flex-col gap-3">
            <Link href={`/ merchants / ${merchant.id} `} className="w-full">
              <Button className="w-full rounded-full h-10 font-medium" variant="primary">
                Visit store
              </Button>
            </Link>
            <Link href={getWhatsAppLink(merchant.phone, merchant.name)} target='_blank' className="w-full">
              <Button variant="outline" className="w-full rounded-full h-10 font-medium text-brand-600 border-brand-200 hover:bg-brand-50">
                <MessageCircle className="w-4 h-4 mr-2" /> Message seller
              </Button>
            </Link>
            {/* <Button variant="outline" className="w-full rounded-full h-10 font-medium text-brand-600 border-brand-200 hover:bg-brand-50">
              <Heart className="w-4 h-4 mr-2" /> Save seller
            </Button> */}
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <h3 className="text-lg font-bold text-text mb-6">Detailed seller ratings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Accurate description</span>
              <div className="flex items-center gap-4">
                <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-text w-[92%]"></div>
                </div>
                <span className="font-medium text-text">4.6</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Reasonable shipping cost</span>
              <div className="flex items-center gap-4">
                <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-text w-[88%]"></div>
                </div>
                <span className="font-medium text-text">4.4</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Shipping speed</span>
              <div className="flex items-center gap-4">
                <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-text w-[98%]"></div>
                </div>
                <span className="font-medium text-text">4.9</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Communication</span>
              <div className="flex items-center gap-4">
                <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-text w-[98%]"></div>
                </div>
                <span className="font-medium text-text">4.9</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-4">Average for the last 12 months</p>
        </div>

        {/* When the endpoints for Popular categories is already  */}
        {/* <div className="border-t border-border pt-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-text">Popular categories</h3>
            <Link href={`/ merchants / ${merchant.id} `} className="text-sm font-medium text-text underline hover:text-brand-600">See all</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-surface-1 rounded-full text-sm text-text border border-border">Consumer Electronics</span>
            <span className="px-3 py-1.5 bg-surface-1 rounded-full text-sm text-text border border-border">Fashion & Apparel</span>
          </div>
        </div> */}

        {/* Network / Referral placeholder as requested by user */}
        <div className="border-t border-border pt-8">
          <h3 className="text-lg font-bold text-text mb-4">Referral Network</h3>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <p className="text-sm text-brand-800 mb-3">
              This merchant is part of the BuyNaija referral network. You can earn commissions by referring their products!
            </p>
            <Link href={`/auth/register/?ref=${merchant.id}`}>
              <Button size="sm" variant="outline" className="w-full bg-white border-brand-200 text-brand-700 hover:bg-brand-100">
                Join their network
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Seller Feedback / Reviews */}
      <div className="md:col-span-8 bg-surface rounded-2xl p-6 border border-border">
        <h2 className="text-2xl font-bold text-text mb-2">Seller feedback <span className="text-text-muted font-normal">(0)</span></h2>

        <div className="mt-8">
          <ReviewList
            productId={productId}
            isEligibleToReview={isEligibleToReview}
          />
        </div>
      </div>
    </div>
  );
}
