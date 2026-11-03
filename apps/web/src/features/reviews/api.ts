import { Review, ReviewListResponse, ModerationReviewListResponse, SellerRating, ReviewSummary } from './types';
import { mockReviews, mockReviewSummary, mockSellerRating } from './mocks';
import { ReviewFormValues, RejectReviewFormValues, ReplyReviewFormValues, ReportReviewFormValues, SellerRatingFormValues } from './schemas';
import { API_MODE, fetchApi } from '@/lib/api';

// --- Types for mock API simulation ---
interface ApiError {
  message: string;
  status: number;
}

export type ReviewFilters = {
  productId?: string;
  merchantId?: string;
  status?: string;
  rating?: number;
  withPhotos?: boolean;
  verified?: boolean;
};

type BackendReview = {
  id: number;
  customer_id: number;
  reviewable_type: 'product' | 'merchant';
  reviewable_id: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  likes: number;
  status: number;
  photos?: Array<{ url: string }>;
  createdAt: string;
  updatedAt: string;
  customer?: { user?: { first_name?: string; last_name?: string } };
};

function moderationStatus(status: number): Review['status'] {
  if (status === 2) return 'Published';
  if (status === 3) return 'Rejected';
  if (status === 4) return 'Reported';
  return 'Pending';
}

function toReview(review: BackendReview): Review {
  return {
    id: String(review.id),
    productId: review.reviewable_type === 'product' ? String(review.reviewable_id) : '',
    merchantId: review.reviewable_type === 'merchant' ? String(review.reviewable_id) : '',
    authorId: String(review.customer_id),
    authorAlias: [review.customer?.user?.first_name, review.customer?.user?.last_name]
      .filter(Boolean)
      .join(' ') || 'Customer',
    verifiedPurchase: true,
    rating: review.rating,
    title: review.title ?? undefined,
    body: review.comment ?? '',
    photos: (review.photos ?? []).map((photo) => photo.url),
    status: moderationStatus(review.status),
    helpfulVotes: review.likes,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

// --- Mock implementations ---

export async function getProductReviews(productId: string, filters?: ReviewFilters, page = 1, limit = 10): Promise<{ data: ReviewListResponse }> {
  if (API_MODE !== 'mock') {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.rating) query.set('rating', String(filters.rating));
    if (filters?.withPhotos) query.set('withPhotos', 'true');
    const response = await fetchApi<{
      data: Array<{
        id: number;
        customer_id: number;
        reviewable_id: number;
        rating: number;
        title?: string | null;
        comment?: string | null;
        likes: number;
        photos?: Array<{ url: string }>;
        createdAt: string;
        updatedAt: string;
        customer?: { user?: { first_name?: string; last_name?: string } };
      }>;
      meta: { totalItems: number; currentPage: number; itemsPerPage: number };
    }>(`/api/v1/storefront/products/${encodeURIComponent(productId)}/reviews?${query.toString()}`);
    const reviews = response.data.map((review) => ({
      id: String(review.id),
      productId,
      merchantId: '',
      authorId: String(review.customer_id),
      authorAlias: [review.customer?.user?.first_name, review.customer?.user?.last_name].filter(Boolean).join(' ') || 'Verified customer',
      verifiedPurchase: true,
      rating: review.rating,
      title: review.title ?? undefined,
      body: review.comment ?? '',
      photos: (review.photos ?? []).map((photo) => photo.url),
      status: 'Published' as const,
      helpfulVotes: review.likes,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));
    const histogram = reviews.reduce<Record<1 | 2 | 3 | 4 | 5, number>>(
      (counts, review) => ({ ...counts, [review.rating as 1 | 2 | 3 | 4 | 5]: (counts[review.rating as 1 | 2 | 3 | 4 | 5] ?? 0) + 1 }),
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    );
    return { data: {
      data: reviews,
      total: response.meta.totalItems,
      page: response.meta.currentPage,
      limit: response.meta.itemsPerPage,
      summary: {
        averageRating: reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0,
        totalReviews: response.meta.totalItems,
        histogram,
      },
    } };
  }
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 600));

  let filtered = mockReviews.filter(r => r.status === 'Published');
  const exactMatch = filtered.filter(r => r.productId === productId || r.merchantId === productId);
  if (exactMatch.length > 0) {
    filtered = exactMatch;
  }

  if (filters?.rating) {
    filtered = filtered.filter(r => r.rating === filters.rating);
  }
  if (filters?.withPhotos) {
    filtered = filtered.filter(r => r.photos && r.photos.length > 0);
  }
  if (filters?.verified) {
    filtered = filtered.filter(r => r.verifiedPurchase);
  }

  // Generate dynamic summary for this product (mock)
  const summary: ReviewSummary = { ...mockReviewSummary };
  
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  return {
    data: {
      data: paginated,
      total: filtered.length,
      page,
      limit,
      summary
    }
  };
}

export async function submitProductReview(productId: string, data: ReviewFormValues): Promise<{ data: Review }> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    merchantId: 'M-123', // Hardcoded mock
    authorId: 'C-005',
    authorAlias: 'Current User',
    verifiedPurchase: true,
    rating: data.rating,
    title: data.title,
    body: data.body,
    photos: data.photos || [],
    status: 'Pending',
    helpfulVotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockReviews.unshift(newReview);
  return { data: newReview };
}

export async function submitSellerRating(merchantId: string, orderId: string, data: SellerRatingFormValues): Promise<{ data: SellerRating }> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return { data: mockSellerRating };
}

export async function voteReviewHelpful(reviewId: string): Promise<{ data: Review }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const review = mockReviews.find(r => r.id === reviewId);
  if (!review) throw new Error('Review not found');
  
  review.helpfulVotes += 1;
  return { data: review };
}

export async function reportReview(reviewId: string, data: ReportReviewFormValues): Promise<{ data: Review }> {
  await new Promise(resolve => setTimeout(resolve, 600));
  const review = mockReviews.find(r => r.id === reviewId);
  if (!review) throw new Error('Review not found');
  
  review.status = 'Reported';
  review.reportReason = data.reason;
  return { data: review };
}

// --- Admin / Moderation API ---

export async function getModerationReviews(filters?: { status?: string }, page = 1, limit = 10): Promise<{ data: ModerationReviewListResponse }> {
  if (API_MODE !== 'mock') {
    const statusMap: Record<string, number> = {
      Pending: 1,
      Published: 2,
      Rejected: 3,
      Reported: 4,
    };
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.status && filters.status !== 'All') {
      query.set('status', String(statusMap[filters.status]));
    }
    const response = await fetchApi<{
      data: BackendReview[];
      meta: { totalItems: number; currentPage: number; itemsPerPage: number };
    }>(`/api/v1/reviews/moderation?${query.toString()}`);
    return {
      data: {
        data: response.data.map(toReview),
        total: response.meta.totalItems,
        page: response.meta.currentPage,
        limit: response.meta.itemsPerPage,
      },
    };
  }
  await new Promise(resolve => setTimeout(resolve, 600));
  
  let filtered = [...mockReviews];
  if (filters?.status && filters.status !== 'All') {
    filtered = filtered.filter(r => r.status === filters.status);
  }

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  
  return {
    data: {
      data: paginated,
      total: filtered.length,
      page,
      limit
    }
  };
}

export async function approveReview(reviewId: string): Promise<{ data: Review }> {
  if (API_MODE !== 'mock') {
    const review = await fetchApi<BackendReview>(`/api/v1/reviews/${encodeURIComponent(reviewId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 2 }),
    });
    return { data: toReview(review) };
  }
  await new Promise(resolve => setTimeout(resolve, 600));
  const review = mockReviews.find(r => r.id === reviewId);
  if (!review) throw new Error('Review not found');
  
  review.status = 'Published';
  return { data: review };
}

export async function rejectReview(reviewId: string, data: RejectReviewFormValues): Promise<{ data: Review }> {
  if (API_MODE !== 'mock') {
    const review = await fetchApi<BackendReview>(`/api/v1/reviews/${encodeURIComponent(reviewId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 3 }),
    });
    return { data: toReview(review) };
  }
  await new Promise(resolve => setTimeout(resolve, 600));
  const review = mockReviews.find(r => r.id === reviewId);
  if (!review) throw new Error('Review not found');
  
  review.status = 'Rejected';
  review.rejectReason = data.reason;
  return { data: review };
}

export async function replyToReview(reviewId: string, data: ReplyReviewFormValues): Promise<{ data: Review }> {
  await new Promise(resolve => setTimeout(resolve, 600));
  const review = mockReviews.find(r => r.id === reviewId);
  if (!review) throw new Error('Review not found');
  
  review.merchantReply = {
    body: data.body,
    createdAt: new Date().toISOString()
  };
  return { data: review };
}
