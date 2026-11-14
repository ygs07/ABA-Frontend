import { Merchant } from "../merchants/types";

export interface MerchantProfile extends Merchant { 
  description: string;
  rating: number;
  reviewCount: number;
  joinedDate: string;
  isVerified: boolean;
  totalProducts: number;
  // location: string;
  followerCount: number;
  onTimeDispatch: number; // percentage
  returnRate: number; // percentage
  avgResponseTime: string; // e.g., "Under 2 hours"
  monthlyOrderCounts: { month: string; count: number }[];
  isSaved?: boolean;
}

export interface MerchantReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}
