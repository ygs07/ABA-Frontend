'use client';

import React from 'react';
import { Store, Star, MapPin, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MerchantProfile } from '@/features/merchant/types';
import { ShareMenu } from '@/components/patterns/ShareMenu';
import { MessageSellerDialog } from './MessageSellerDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveSeller, unsaveSeller } from '@/features/merchant/api';
import { toast } from 'sonner';
import { getWhatsAppLink } from '@/lib/utils';
// Optionally, if auth is required for saveSeller, check user status.

interface MerchantHeaderProps {
  merchant: MerchantProfile;
}

export function MerchantHeader({ merchant }: MerchantHeaderProps) {
  const queryClient = useQueryClient();

  return (
    <div className="bg-brand-700 min-h-[320px] md:min-h-[256px] relative flex flex-col justify-end">
      {merchant.bannerImage ? (
        <img src={merchant.bannerImage} alt="Banner" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
      ) : (
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 pb-8 relative z-10 mt-auto">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 w-full">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center shrink-0 overflow-hidden">
            {merchant.logoUrl ? (
              <img src={merchant.logoUrl} alt={merchant.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-12 h-12 text-brand-300" />
            )}
          </div>
          <div className="flex-1 text-white pb-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{merchant.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-brand-50">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {merchant.location}</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning-main fill-warning-main" /> {merchant.rating} ({merchant.reviewCount} Reviews)
              </span>
              {merchant.isVerified ? (
                <span className="bg-white/20 px-2 py-0.5 rounded font-medium text-xs uppercase tracking-wide">Verified Merchant</span>
              ) : merchant.isProvisional ? (
                <span className="bg-amber-500/90 text-white px-2 py-0.5 rounded font-medium text-xs uppercase tracking-wide">Provisional Seller (60d)</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pb-2 sm:flex">
            <a target='_blank' href={getWhatsAppLink(merchant.whatsappNumber || merchant.phone, merchant.name)} >
              <Button variant="outline" className="text-white border-white hover:bg-white/10">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
            </a>
            <ShareMenu
              title={merchant.name}
              text={`Check out ${merchant.name} on ABA ERP`}
              url={`/merchants/${merchant.id}`}
            />
          </div>
        </div>
      </div>
    </div >
  );
}
