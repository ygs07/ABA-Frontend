import { API_MODE, fetchApi } from '@/lib/api';
import { MerchantProfile, MerchantReview } from './types';
import { MOCK_MERCHANTS, mockMerchantReviews } from './mocks';
import { Merchant } from '../merchants/types';
import { CreateMerchantInput } from '../merchants/schemas';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type BackendMerchant = {
  id: number | string;
  business_name: string;
  business_owner_phone_number: string;
  business_address: string;
  business_owner_name: string;
  business_owner_email: string;
  website?: string | null;
  rc_tax_id?: string | null;
  merchant_type: 1 | 2 | 3;
  status: 1 | 2 | 3 | 4;
  bio?: string | null;
  verified_at?: string | null;
  createdAt?: string;
  created_at?: string;
  ordersCount?: number;
  rating?: number;
  reviewCount?: number;
  location?: { street_address: string; city: string; state: string; lga?: string | null } | null;
};

type PaginatedMerchants = { data: BackendMerchant[] };

type BackendStorefrontMerchant = Pick<
  BackendMerchant,
  | 'id'
  | 'business_name'
  | 'business_address'
  | 'website'
  | 'bio'
  | 'merchant_type'
  | 'status'
  | 'verified_at'
  | 'createdAt'
  | 'created_at'
  | 'ordersCount'
  | 'rating'
  | 'reviewCount'
  | 'location'
> & {
  avatar?: { url: string } | null;
  banner?: { url: string } | null;
  storeCategories?: { categories?: Array<{ count: number }> };
  salesHistory?: Array<{ month: string; ordersCount: number }>;
};

function toMerchantType(type: BackendMerchant['merchant_type']): Merchant['type'] {
  return type === 1 ? 'Own outlet' : type === 2 ? 'Franchise' : 'Partner';
}

function toMerchantStatus(status: BackendMerchant['status']): Merchant['status'] {
  return status === 2 ? 'Active' : status === 3 ? 'Rejected' : status === 4 ? 'Suspended' : 'Pending';
}

function toMerchant(merchantRecord: BackendMerchant): Merchant {
  return {
    id: String(merchantRecord.id),
    merchantNo: `MER-${merchantRecord.id}`,
    name: merchantRecord.business_name,
    legalName: merchantRecord.business_name,
    type: toMerchantType(merchantRecord.merchant_type),
    rcNumber: merchantRecord.rc_tax_id ?? undefined,
    description: merchantRecord.bio ?? undefined,
    isVerified: Boolean(merchantRecord.verified_at),
    ownerName: merchantRecord.business_owner_name,
    phone: merchantRecord.business_owner_phone_number,
    email: merchantRecord.business_owner_email,
    website: merchantRecord.website ?? undefined,
    address: merchantRecord.location?.street_address ?? merchantRecord.business_address,
    city: merchantRecord.location?.city ?? '',
    state: merchantRecord.location?.state ?? '',
    lga: merchantRecord.location?.lga ?? undefined,
    settlementBank: { bankName: '', accountNumber: '', accountName: merchantRecord.business_owner_name },
    settlementFrequency: 'Weekly',
    priceList: 'Default',
    discountLimit: 0,
    creditLimit: 0,
    status: merchantRecord.verified_at ? 'Active' : toMerchantStatus(merchantRecord.status),
    onboardedAt: merchantRecord.createdAt ?? merchantRecord.created_at ?? new Date().toISOString(),
    salesPeriod: 0,
    ordersCount: 0,
    stockValue: 0,
    outstandingBalance: 0,
  };
}

function toMerchantProfile(merchantRecord: BackendMerchant): MerchantProfile {
  const merchant = toMerchant(merchantRecord);

  return {
    ...merchant,
    description: merchantRecord.bio ?? '',
    rating: 0,
    reviewCount: merchantRecord.reviewCount ?? 0,
    joinedDate: merchant.onboardedAt,
    isVerified: Boolean(merchantRecord.verified_at),
    totalProducts: 0,
    location: merchant.address,
    followerCount: 0,
    onTimeDispatch: 0,
    returnRate: 0,
    avgResponseTime: 'Not available',
    monthlyOrderCounts: [],
    isSaved: false,
  };
}

function toStorefrontMerchantProfile(merchantRecord: BackendStorefrontMerchant): MerchantProfile {
  const joinedDate = merchantRecord.createdAt ?? merchantRecord.created_at ?? new Date().toISOString();

  return {
    id: String(merchantRecord.id),
    merchantNo: `MER-${merchantRecord.id}`,
    name: merchantRecord.business_name,
    legalName: merchantRecord.business_name,
    type: toMerchantType(merchantRecord.merchant_type),
    description: merchantRecord.bio ?? '',
    isVerified: Boolean(merchantRecord.verified_at),
    ownerName: '',
    phone: '',
    email: '',
    website: merchantRecord.website ?? undefined,
    address: merchantRecord.location?.street_address ?? merchantRecord.business_address,
    city: merchantRecord.location?.city ?? '',
    state: merchantRecord.location?.state ?? '',
    lga: merchantRecord.location?.lga ?? undefined,
    logoUrl: merchantRecord.avatar?.url,
    bannerImage: merchantRecord.banner?.url,
    settlementBank: { bankName: '', accountNumber: '', accountName: '' },
    settlementFrequency: 'Weekly',
    priceList: 'Default',
    discountLimit: 0,
    creditLimit: 0,
    status: toMerchantStatus(merchantRecord.status),
    onboardedAt: joinedDate,
    salesPeriod: 0,
    ordersCount: merchantRecord.ordersCount ?? 0,
    stockValue: 0,
    outstandingBalance: 0,
    rating: merchantRecord.rating ?? 0,
    reviewCount: merchantRecord.reviewCount ?? 0,
    joinedDate,
    totalProducts: merchantRecord.storeCategories?.categories?.reduce(
      (total, category) => total + category.count,
      0,
    ) ?? 0,
    location: merchantRecord.location
      ? [merchantRecord.location.street_address, merchantRecord.location.city, merchantRecord.location.state].filter(Boolean).join(', ')
      : merchantRecord.business_address,
    followerCount: 0,
    onTimeDispatch: 0,
    returnRate: 0,
    avgResponseTime: 'Not available',
    monthlyOrderCounts: (merchantRecord.salesHistory ?? []).map((history) => ({
      month: history.month,
      count: history.ordersCount,
    })),
    isSaved: false,
  };
}

export const getMerchants = async (): Promise<{ data: Merchant[] }> => {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<PaginatedMerchants>('/api/v1/merchants?limit=100');
    return { data: response.data.map(toMerchant) };
  }

  await delay(800);
  return { data: MOCK_MERCHANTS };
};

export const getMerchantById = async (id: string): Promise<{ data: MerchantProfile }> => {
  if (API_MODE !== 'mock') {
    const merchantRecord = await fetchApi<BackendMerchant>(`/api/v1/merchants/${encodeURIComponent(id)}`);
    return { data: toMerchantProfile(merchantRecord) };
  }

  await delay(500);
  const merchant = MOCK_MERCHANTS.find(m => m.id === id || m.merchantNo === id);
  if (!merchant) throw new Error('Merchant not found');
  
  // Extend with profile properties for the storefront
  const profile: MerchantProfile = {
    ...merchant,
    description: merchant.description || '',
    rating: merchant.rating || 4.5,
    reviewCount: merchant.reviewCount || 10,
    joinedDate: merchant.onboardedAt,
    isVerified: !!merchant.isVerified,
    totalProducts: 45, // Mock data
    location: `${merchant.city}, ${merchant.state}`,
    followerCount: 1540,
    onTimeDispatch: 98,
    returnRate: 2,
    avgResponseTime: 'Under 2 hours',
    monthlyOrderCounts: [
      { month: 'Jan', count: 120 },
      { month: 'Feb', count: 150 },
      { month: 'Mar', count: 200 },
      { month: 'Apr', count: 180 },
    ],
    isSaved: false // Could be dynamic from a saved set
  };
  
  return { data: profile };
};

export const getStorefrontMerchantById = async (
  id: string,
): Promise<{ data: MerchantProfile }> => {
  if (API_MODE !== 'mock') {
    const merchantRecord = await fetchApi<BackendStorefrontMerchant>(
      `/api/v1/storefront/merchants/${encodeURIComponent(id)}`,
    );
    return { data: toStorefrontMerchantProfile(merchantRecord) };
  }

  return getMerchantById(id);
};

export const createMerchant = async (data: CreateMerchantInput): Promise<{ data: Merchant }> => {
  if (API_MODE !== 'mock') {
    const merchantRecord = await fetchApi<BackendMerchant>('/api/v1/merchants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: data.userId,
        userFirstName: data.userFirstName,
        userLastName: data.userLastName,
        userUsername: data.userUsername,
        userPassword: data.userPassword,
        businessName: data.name,
        businessOwnerPhoneNumber: data.phone,
        businessAddress: [data.address, data.city, data.state, data.lga].filter(Boolean).join(', '),
        businessOwnerName: data.ownerName,
        businessOwnerEmail: data.email,
        website: data.website || undefined,
        rcTaxId: data.rcNumber || undefined,
        merchantType: data.type === 'Own outlet' ? 1 : data.type === 'Franchise' ? 2 : 3,
      }),
    });

    return { data: toMerchant(merchantRecord) };
  }

  await delay(1000);

  const newMerchant: Merchant = {
    id: `mer-${Date.now()}`,
    merchantNo: `MER-${Math.floor(Math.random() * 9000) + 1000}`,
    ...data,
    settlementBank: { bankName: '', accountNumber: '', accountName: data.legalName },
    settlementFrequency: 'Weekly',
    priceList: 'Default',
    discountLimit: 0,
    creditLimit: 0,
    status: 'Pending',
    onboardedAt: new Date().toISOString(),
    salesPeriod: 0,
    ordersCount: 0,
    stockValue: 0,
    outstandingBalance: 0,
  };

  MOCK_MERCHANTS.unshift(newMerchant);
  return { data: newMerchant };
};

export const approveMerchant = async (id: string): Promise<{ data: Merchant }> => {
  if (API_MODE !== 'mock') {
    const merchantRecord = await fetchApi<BackendMerchant>(`/api/v1/merchants/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH',
    });
    return { data: toMerchant(merchantRecord) };
  }

  await delay(500);
  const merchant = MOCK_MERCHANTS.find((item) => item.id === id || item.merchantNo === id);
  if (!merchant) throw new Error('Merchant not found');
  merchant.status = 'Active';
  merchant.isVerified = true;
  return { data: merchant };
};

export const suspendMerchant = async (id: string): Promise<{ data: Merchant }> => {
  if (API_MODE !== 'mock') {
    const merchantRecord = await fetchApi<BackendMerchant>(`/api/v1/merchants/${encodeURIComponent(id)}/suspend`, {
      method: 'PATCH',
    });
    return { data: toMerchant(merchantRecord) };
  }

  await delay(500);
  const merchant = MOCK_MERCHANTS.find((item) => item.id === id || item.merchantNo === id);
  if (!merchant) throw new Error('Merchant not found');
  merchant.status = 'Suspended';
  return { data: merchant };
};

export const updateMerchant = async (
  id: string,
  data: Partial<CreateMerchantInput>,
): Promise<{ data: Merchant }> => {
  if (API_MODE !== 'mock') {
    const merchantType = data.type === undefined
      ? undefined
      : data.type === 'Own outlet' ? 1 : data.type === 'Franchise' ? 2 : 3;
    const merchantRecord = await fetchApi<BackendMerchant>(`/api/v1/merchants/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(data.name === undefined ? {} : { businessName: data.name }),
        ...(data.phone === undefined ? {} : { businessOwnerPhoneNumber: data.phone }),
        ...(data.address === undefined ? {} : {
          businessAddress: [data.address, data.city, data.state, data.lga].filter(Boolean).join(', '),
        }),
        ...(data.ownerName === undefined ? {} : { businessOwnerName: data.ownerName }),
        ...(data.email === undefined ? {} : { businessOwnerEmail: data.email }),
        ...(data.website === undefined ? {} : { website: data.website || undefined }),
        ...(data.rcNumber === undefined ? {} : { rcTaxId: data.rcNumber || undefined }),
        ...(merchantType === undefined ? {} : { merchantType }),
      }),
    });
    return { data: toMerchant(merchantRecord) };
  }

  const merchant = MOCK_MERCHANTS.find((item) => item.id === id || item.merchantNo === id);
  if (!merchant) throw new Error('Merchant not found');
  Object.assign(merchant, data);
  return { data: merchant };
};

export const deleteMerchant = async (id: string): Promise<void> => {
  if (API_MODE !== 'mock') {
    await fetchApi<void>(`/api/v1/merchants/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return;
  }

  const merchantIndex = MOCK_MERCHANTS.findIndex((item) => item.id === id || item.merchantNo === id);
  if (merchantIndex === -1) throw new Error('Merchant not found');
  MOCK_MERCHANTS.splice(merchantIndex, 1);
};


// export async function getMerchantBySlug(slug: string): Promise<{ data: MerchantProfile }> {
//   await delay(400);
//   const merchant = MOCK_MERCHANTS.find(m => m.slug === slug);
//   if (!merchant) {
//     throw new ApiError(404, 'Merchant not found', 'NOT_FOUND');
//   }
//   return { data: merchant };
// }

export async function getMerchantReviews(merchantId: string): Promise<{ data: MerchantReview[] }> {
  await delay(300);
  return { data: mockMerchantReviews[merchantId] || [] };
}

// Storefront Follow/Saved Sellers mock data
let mockSavedSellerIds: string[] = [];

export async function saveSeller(merchantId: string): Promise<{ data: { success: boolean } }> {
  await delay(400);
  if (!mockSavedSellerIds.includes(merchantId)) {
    mockSavedSellerIds.push(merchantId);
  }
  return { data: { success: true } };
}

export async function unsaveSeller(merchantId: string): Promise<{ data: { success: boolean } }> {
  await delay(400);
  mockSavedSellerIds = mockSavedSellerIds.filter(id => id !== merchantId);
  return { data: { success: true } };
}

export async function getSavedSellers(): Promise<{ data: MerchantProfile[] }> {
  await delay(500);
  // Just map from mock merchants
  const saved = MOCK_MERCHANTS.filter(m => mockSavedSellerIds.includes(m.id)).map(merchant => ({
    ...merchant,
    description: merchant.description || '',
    rating: merchant.rating || 4.5,
    reviewCount: merchant.reviewCount || 10,
    joinedDate: merchant.onboardedAt,
    isVerified: !!merchant.isVerified,
    totalProducts: 45,
    location: `${merchant.city}, ${merchant.state}`,
    followerCount: 1541,
    onTimeDispatch: 98,
    returnRate: 2,
    avgResponseTime: 'Under 2 hours',
    monthlyOrderCounts: [],
    isSaved: true
  }));
  return { data: saved };
}

export async function sendMessageToSeller(merchantId: string, payload: { subject: string; message: string }): Promise<{ data: { success: boolean } }> {
  void merchantId;
  void payload;
  await delay(600);
  // In a real app this would trigger notifications/emails
  return { data: { success: true } };
}
