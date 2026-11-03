import { API_MODE, ApiError, fetchApi } from '@/lib/api';
import { SpotlightSettings, SpotlightHistoryLog, SpotlightMerchant, AnalyticsEvent } from './types';
import { mockSpotlightSettings, mockSpotlightHistory } from './mocks';
import { mockShopMerchants, mockShopProducts } from '../shop/mocks';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getSpotlightSettings(): Promise<{ data: SpotlightSettings }> {
  await delay(400);
  return { data: mockSpotlightSettings };
}

export async function updateSpotlightSettings(settings: Partial<SpotlightSettings>): Promise<{ data: SpotlightSettings }> {
  await delay(500);
  Object.assign(mockSpotlightSettings, settings);
  mockSpotlightHistory.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Admin',
    action: 'Settings Updated',
    details: 'Updated spotlight configuration.'
  });
  return { data: mockSpotlightSettings };
}

export async function runSpotlightRefresh(): Promise<{ data: { success: boolean; generatedSlots: number } }> {
  await delay(800);
  mockSpotlightHistory.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Admin',
    action: 'Manual Refresh',
    details: 'Triggered a manual re-calculation of the spotlight engine.'
  });
  return { data: { success: true, generatedSlots: mockSpotlightSettings.slots } };
}

export async function getSpotlightHistory(): Promise<{ data: SpotlightHistoryLog[] }> {
  await delay(300);
  return { data: mockSpotlightHistory };
}

export async function getStorefrontSpotlight(): Promise<{ data: SpotlightMerchant[] }> {
  if (API_MODE !== 'mock') {
    const merchants = await fetchApi<Array<{
      id: number;
      businessName: string;
      website?: string | null;
      productCount?: string | number;
      avatar?: { url: string } | null;
      banner?: { url: string } | null;
    }>>('/api/v1/storefront/merchants-spotlight');
    return {
      data: merchants.map((merchant) => ({
        id: String(merchant.id),
        name: merchant.businessName,
        logoUrl: merchant.avatar?.url,
        bannerUrl: merchant.banner?.url,
        location: merchant.website ?? 'Nigeria',
        rating: 0,
        orderCount: 0,
        topProducts: [],
      })),
    };
  }
  await delay(600);
  
  // Implementation of the scoring/rotation engine mock
  const { slots, mode, pinnedMerchants, eligibilityThresholds } = mockSpotlightSettings;
  
  // 1. Filter out inactive and suspended
  let eligibleMerchants = mockShopMerchants.filter(m => m.status === 'Active');
  
  // 2. Score merchants (Mock random scoring for now, but usually it uses the weights)
  // Actually we should simulate the score calculation so we have somewhat deterministic results
  const scoredMerchants = eligibleMerchants.map(m => {
    // Generate a pseudo-random score based on their ID length or name so it's stable
    const mockScore = (m.name.length * 10) % 100;
    return { ...m, _score: mockScore };
  });

  scoredMerchants.sort((a, b) => b._score - a._score);
  
  let selectedIds: string[] = [];
  
  if (mode === 'Manual') {
    selectedIds = pinnedMerchants.slice(0, slots);
  } else if (mode === 'Automatic') {
    selectedIds = scoredMerchants.map(m => m.id).slice(0, slots);
  } else {
    // Mixed
    const manualSlots = pinnedMerchants.length;
    selectedIds = [...pinnedMerchants];
    const remainingSlots = slots - manualSlots;
    if (remainingSlots > 0) {
      const autoIds = scoredMerchants.map(m => m.id).filter(id => !selectedIds.includes(id)).slice(0, remainingSlots);
      selectedIds = [...selectedIds, ...autoIds];
    }
  }
  
  const finalMerchants = mockShopMerchants.filter(m => selectedIds.includes(m.id));
  
  // Assemble the SpotlightMerchant type
  const data: SpotlightMerchant[] = finalMerchants.map(m => {
    // Top 3 products
    const mProducts = mockShopProducts.filter(p => p.merchant?.id === m.id);
    mProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    return {
      id: m.id,
      name: m.name,
      logoUrl: m.logoUrl,
      bannerUrl: m.bannerImage,
      location: m.city + ', ' + m.state,
      rating: 4.5, // Mock
      orderCount: 150, // Mock
      topProducts: mProducts.slice(0, 3)
    };
  });
  
  return { data };
}

export async function getCategorySpotlight(categorySlug: string): Promise<{ data: SpotlightMerchant[] }> {
  await delay(400);
  
  // Mock finding vendors that sell in this category
  // Just use the storefront spotlight and filter randomly or simply return top 4
  const res = await getStorefrontSpotlight();
  return { data: res.data.slice(0, 4) }; // Return up to 4
}

export async function trackSpotlightEvent(eventData: AnalyticsEvent): Promise<void> {
  // Fire and forget
  console.log('[Analytics] Spotlight Event:', eventData);
}
