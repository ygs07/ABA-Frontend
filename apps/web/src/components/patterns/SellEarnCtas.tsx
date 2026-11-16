import React from 'react';
import Link from 'next/link';
import { Store, TrendingUp, Camera, Lock, Truck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * "Sell" and "Earn" calls to action (Doc 06 §2.3). Uses the amber `--store-warm` accent (Doc 06 §12).
 * Shared by the storefront header utility strip and the /dev/theme preview.
 */
export function SellEarnCtas() {
  return (
    <div className="flex w-full md:w-auto gap-2 text-xs md:text-sm">
      <Popover>
        <PopoverTrigger className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 font-bold">
          <Store className="w-4 h-4 text-white" strokeWidth={2.5} />
          <span className="hidden md:inline tracking-tight">Sell: Start your store</span>
          <span className="md:hidden tracking-tight">Sell</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[360px] p-6 rounded-3xl shadow-xl mt-2 border-border/50">
          <h2 className="text-2xl font-bold text-brand-950 mb-1">Start selling in a snap</h2>
          <p className="text-[15px] text-text-muted mb-6">Turn your pre-loved items into extra cash.</p>

          <div className="space-y-5 mb-8">
            <div className="flex gap-4 items-start">
              <Camera className="w-6 h-6 text-brand-950 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[15px] font-medium text-brand-950 leading-snug">Listing is easy, and faster than ever in the app</p>
            </div>
            <div className="flex gap-4 items-start">
              <Lock className="w-6 h-6 text-brand-950 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[15px] font-medium text-brand-950 leading-snug">Seller protections and secure payments</p>
            </div>
            <div className="flex gap-4 items-start">
              <Truck className="w-6 h-6 text-brand-950 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[15px] font-medium text-brand-950 leading-snug">Easy shipping and local pickup</p>
            </div>
          </div>

          <Link href="/merchants/onboarding" className="flex items-center justify-center w-full bg-brand-500 text-white py-2 font-bold text-base hover:bg-brand-500/90 transition-colors mb-1 rounded-md">
            Start selling
          </Link>
          <Link href="#" className="flex items-center justify-center w-full bg-white text-brand-950 py-2 font-bold text-base border border-border hover:bg-gray-50 transition-colors rounded-md">
            Download the app
          </Link>
        </PopoverContent>
      </Popover>
      <Link href="/community" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 font-bold">
        <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
        <span className="hidden md:inline tracking-tight">Earn: Refer & get paid</span>
        <span className="md:hidden tracking-tight">Earn</span>
      </Link>
    </div>
  );
}
