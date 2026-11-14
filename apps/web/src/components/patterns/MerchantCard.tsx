import Link from 'next/link';
import { MapPin, ShoppingBag, Star, BadgeCheck, Store } from 'lucide-react';
import { cn } from 'cn';
import type { DirectoryMerchant } from '@/features/merchants/types';

export interface MerchantCardProps {
  merchant: DirectoryMerchant;
  className?: string;
}

/** Compact public merchant card used by the Meet Businesses carousel and the /merchants directory. */
export function MerchantCard({ merchant, className }: MerchantCardProps) {
  const joined = new Date(merchant.onboardedAt).getFullYear();
  return (
    <article className={cn('group h-full flex flex-col bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow', className)}>
      <div className="relative h-24 bg-linear-to-br from-brand-600 to-brand-800">
        {merchant.bannerImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={merchant.bannerImage} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {merchant.isFeatured && (
          <span className="absolute top-2 right-2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-brand-700 shadow">
            Featured
          </span>
        )}
      </div>

      <div className="relative flex flex-col flex-1 px-4 pb-4 pt-8">
        <div className="absolute -top-7 left-4 h-14 w-14 rounded-xl bg-white border-2 border-white shadow flex items-center justify-center overflow-hidden">
          {merchant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={merchant.logoUrl} alt={`${merchant.name} logo`} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <Store className="h-6 w-6 text-brand-400" aria-hidden="true" />
          )}
        </div>

        <h3 className="flex items-center gap-1 font-bold text-text leading-tight">
          <Link href={`/merchants/${merchant.id}`} className="truncate hover:text-brand-600 focus-visible:outline-none focus-visible:underline">
            {merchant.name}
          </Link>
          {merchant.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" aria-label="Verified" />}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-warning-main text-warning-main" aria-hidden="true" />
          <span className="font-semibold text-text">{merchant.rating.toFixed(1)}</span>
          <span className="text-text-muted">({merchant.reviewCount} reviews)</span>
        </div>

        <p className="mt-2 flex items-center gap-1 text-xs text-text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{merchant.business_address || merchant.location || merchant.address}</span>
        </p>
        {/* <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
          <ShoppingBag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Joined {joined} · {merchant.ordersCount.toLocaleString('en-NG')} orders</span>
        </p> */}

        <Link
          href={`/merchants/${merchant.id}`}
          className="mt-4 block rounded-full border border-border bg-surface-1 py-2 text-center text-sm font-semibold text-text transition-colors hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Visit store
        </Link>
      </div>
    </article>
  );
}
