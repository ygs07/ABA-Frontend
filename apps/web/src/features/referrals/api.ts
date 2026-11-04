import { brand } from '@/config/brand';
import { API_MODE, ApiError, fetchApi } from '@/lib/api';
import { NetworkNodeData, ReferralCode, ReferralRecord } from './types';
import { mockNetworkUsers, mockReferralRecords, mockReferralCodes, mockReferralFlags } from './mocks';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function pruneLevels(node: NetworkNodeData, currentLevel: number, maxLevels: number): NetworkNodeData {
  if (currentLevel >= maxLevels || !node.children) {
    return { ...node, children: [] };
  }
  
  return {
    ...node,
    children: node.children.map(child => pruneLevels(child, currentLevel + 1, maxLevels))
  };
}

export async function getNetworkTree(rootId: string = `${brand.referralCodePrefix}492`, maxLevels: number = 999) {
  if (API_MODE !== 'mock') {
    const search = new URLSearchParams({ depth: String(maxLevels) });
    if (rootId.trim()) search.set('root', rootId.trim());
    const network = await fetchApi<NetworkNodeData>(`/api/v1/referrals/network?${search.toString()}`);
    return { data: network };
  }
  await delay(600);
  
  const rootNode = mockNetworkUsers[rootId];
  if (!rootNode) {
    throw new ApiError(404, 'User not found in network', 'NOT_FOUND');
  }

  // Deep clone to avoid mutating the mock structure, then prune levels
  const tree = JSON.parse(JSON.stringify(rootNode));
  const prunedTree = pruneLevels(tree, 0, maxLevels);

  return { data: prunedTree };
}

export async function getReferralRecords(): Promise<{ data: ReferralRecord[] }> {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: Array<{
      id: number;
      referralCode: { code: string };
      referrer: { id: number; username?: string; firstName?: string; lastName?: string };
      referred: { id: number; username?: string; firstName?: string; lastName?: string };
      createdAt: string;
    }> }>('/api/v1/referrals?limit=100');
    return {
      data: response.data.map((referral) => ({
        id: String(referral.id),
        referralNumber: `REF-${String(referral.id).padStart(6, '0')}`,
        referrerName: [referral.referrer.firstName, referral.referrer.lastName]
          .filter(Boolean)
          .join(' ') || referral.referrer.username || 'Referrer',
        referrerCode: referral.referralCode.code,
        referredCustomerName: [referral.referred.firstName, referral.referred.lastName]
          .filter(Boolean)
          .join(' ') || referral.referred.username || 'Customer',
        referredCustomerId: String(referral.referred.id),
        level: 1,
        sourceChannel: 'Referral code',
        dateReferred: referral.createdAt,
        status: 'Registered' as const,
        flags: 0,
      })),
    };
  }
  await delay(300);
  return { data: [...mockReferralRecords] };
}

export async function getReferralCodes(): Promise<{ data: ReferralCode[] }> {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: Array<{
      id: number;
      code: string;
      is_active: boolean;
      signups_count?: number;
      createdAt: string;
      marketer?: { user?: { first_name?: string; last_name?: string; username?: string } };
      customer?: { user?: { first_name?: string; last_name?: string; username?: string } };
    }> }>('/api/v1/referral-codes?limit=100');
    return {
      data: response.data.map((referralCode) => {
        const owner = referralCode.marketer?.user ?? referralCode.customer?.user;
        return {
          id: String(referralCode.id),
          code: referralCode.code,
          ownerName: [owner?.first_name, owner?.last_name]
            .filter(Boolean)
            .join(' ') || owner?.username || 'Referral owner',
          clicks: 0,
          signups: referralCode.signups_count ?? 0,
          conversions: 0,
          status: referralCode.is_active ? 'Active' : 'Disabled',
          createdDate: referralCode.createdAt,
        };
      }),
    };
  }
  await delay(300);
  return { data: [...mockReferralCodes] };
}

export async function getReferralFlags() {
  await delay(300);
  return { data: [...mockReferralFlags] };
}
