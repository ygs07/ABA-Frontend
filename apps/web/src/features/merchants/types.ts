import { PaginationMeta } from "@/components/ui/pagination";

export type MerchantStatus = 'Pending' | 'Active' | 'Suspended' | 'Rejected' | 'Inactive';
export type MerchantType = 'Own outlet' | 'Franchise' | 'Partner';
export type MerchantVerificationStatus = 'pendingReview' | 'verified' | 'provisional' | 'rejected';

export interface MerchantCertification {
  type: string;
  number: string;
  documentName?: string;
  isVerified: boolean;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface Merchant {
  id: string;
  merchantNo: string;
  name: string;
  legalName: string;
  type: MerchantType;
  rcNumber?: string;
  logoUrl?: string;
  bannerImage?: string;
  category?: string;
  description?: string;
  isVerified?: boolean;
  verificationStatus?: MerchantVerificationStatus;
  isProvisional?: boolean;
  provisionalDaysRemaining?: number;
  certifications?: MerchantCertification[];
  /** Full category slug paths (root/sub/leaf) the merchant sells in. Used by CategoryFilter. */
  categoryPaths?: string[];

  // Contact
  ownerName: string;
  phone: string;
  whatsappNumber?: string;
  email: string;
  website?: string;

  // Location
  address: string;
  city: string;
  state: string;
  lga?: string;
  location?: string;
  business_address?: string;

  // Settlement
  settlementBank: BankDetails;
  settlementFrequency: 'Daily' | 'Weekly' | 'On request';

  // Commercial
  priceList: 'Default' | 'Wholesale';
  discountLimit: number;
  creditLimit: number;

  status: MerchantStatus;
  onboardedAt: string;

  // KPIs
  salesPeriod: number; // 30d sales in Kobo
  ordersCount: number;
  stockValue: number;
  outstandingBalance: number;

  // Ratings
  rating?: number;
  reviewCount?: number;
}

// ---- Public directory (Doc 06 §6) ----

export type MerchantSort = 'recommended' | 'newest' | 'rating' | 'orders';

/** A merchant as shown publicly: always has rating data, a spotlight score and a Featured flag. */
export type DirectoryMerchant = Merchant & {
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  categoryPaths: string[];
  spotlightScore: number;
  isFeatured: boolean;
};

export interface DirectoryParams {
  q?: string;
  /** Full category path from CategoryFilter, e.g. `fashion-apparel/mens-fashion`. */
  category?: string;
  state?: string;
  minRating?: number;
  verifiedOnly?: boolean;
  sort?: MerchantSort;
  page?: number;
  pageSize?: number;
  hasProducts?: boolean;
}

export interface DirectoryResult {
  data: DirectoryMerchant[];
  meta: PaginationMeta;
  facets: { states: string[] };
}
