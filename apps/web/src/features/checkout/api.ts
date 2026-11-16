import { API_MODE, ApiError, fetchApi } from '@/lib/api';
import { CheckoutAddressInput, CheckoutPaymentInput } from './schemas';
import { CheckoutSession, OrderDetail } from './types';
import { sampleOrderData } from './mocks';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type ReferralCandidate = {
  customerId: number;
  userId: number;
  name: string;
  username: string | null;
  referralCode: string;
};

export async function searchReferralCandidates(query: string): Promise<ReferralCandidate[]> {
  if (API_MODE === 'mock' || query.trim().length < 2) return [];
  return fetchApi<ReferralCandidate[]>(
    `/api/v1/checkout/referral-candidates?query=${encodeURIComponent(query.trim())}`,
  );
}

export async function initializeCheckout(_cartId: string): Promise<{ data: CheckoutSession }> {
  await delay(500);
  return { 
    data: {
      id: `chk_${Math.random().toString(36).substring(2, 9)}`,
      status: 'active',
      totalAmount: 42150000,
      createdAt: new Date().toISOString()
    }
  };
}

export async function processCheckout(
  sessionId: string,
  address: CheckoutAddressInput,
  payment: CheckoutPaymentInput,
  selectedDeliveryAddressId?: number,
  deliveryMethod: 1 | 2 | 3 = 1,
  referralCode?: string,
  useShoppingCredits?: boolean,
): Promise<{ data: { orderId: string, status: string, authorizationUrl?: string } }> {
  if (API_MODE !== 'mock') {
    void sessionId;
    const savedAddresses = await getDeliveryAddresses();
    let deliveryAddress = selectedDeliveryAddressId
      ? savedAddresses.data.find((savedAddress) => savedAddress.id === selectedDeliveryAddressId)
      : undefined;
    if (!deliveryAddress) {
      deliveryAddress = savedAddresses.data.find((savedAddress) =>
        savedAddress.street === address.street &&
        savedAddress.city === address.city &&
        savedAddress.state === address.state &&
        savedAddress.zip === (address.zipCode ?? '')
      );
    }
    if (!deliveryAddress) {
      deliveryAddress = await fetchApi<typeof deliveryAddress>('/api/v1/delivery-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: address.fullName,
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zipCode || 'N/A',
        }),
      });
    }
    if (!deliveryAddress) {
      throw new ApiError(500, 'Unable to create or select a delivery address');
    }
    const response = await fetchApi<{
      order: { id: number; status?: number | string };
      authorizationUrl?: string;
    }>(payment.method === 'card' ? '/api/v1/checkout/paystack' : '/api/v1/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryAddressId: deliveryAddress.id,
        deliveryMethod,
        paymentMethod: payment.method === 'wallet' ? 2 : 1,
        ...(referralCode?.trim() ? { referralCode: referralCode.trim() } : {}),
        useShoppingCredits,
      }),
    });
    return {
      data: {
        orderId: String(response.order.id),
        status: String(response.order.status ?? 'pending'),
        authorizationUrl: response.authorizationUrl,
      },
    };
  }
  await delay(1200);

  if (payment.method === 'wallet') {
    // Mock check for wallet balance
    const userBalance = 150000000; // 150k
    if (42150000 > userBalance) {
      throw new ApiError(400, 'Insufficient wallet balance', 'INSUFFICIENT_FUNDS');
    }
  }

  return {
    data: {
      orderId: `ORD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: 'Processing'
    }
  };
}

export type DeliveryAddress = {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  createdAt: string;
};

export async function getDeliveryAddresses(): Promise<{ data: DeliveryAddress[] }> {
  return fetchApi<{ data: DeliveryAddress[] }>('/api/v1/delivery-address?limit=100');
}

export async function getOrderDetail(id: string | number): Promise<OrderDetail> {
  if (API_MODE === 'mock') {
    return sampleOrderData;
  }
  const endpoint = /^\d+$/.test(String(id))
    ? `/api/v1/orders/id/${encodeURIComponent(id)}`
    : `/api/v1/orders/${encodeURIComponent(id)}`;
  return fetchApi<OrderDetail>(endpoint);
}
