import { API_MODE, ApiError, fetchApi } from '@/lib/api';
import { CheckoutAddressInput, CheckoutPaymentInput } from './schemas';
import { CheckoutSession } from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function initializeCheckout(cartId: string): Promise<{ data: CheckoutSession }> {
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
  payment: CheckoutPaymentInput
): Promise<{ data: { orderId: string, status: string, authorizationUrl?: string } }> {
  if (API_MODE !== 'mock') {
    void sessionId;
    const savedAddresses = await fetchApi<{ data: Array<{
      id: number;
      street: string;
      city: string;
      state: string;
      zip: string;
    }> }>('/api/v1/delivery-address?limit=100');
    let deliveryAddress = savedAddresses.data.find((savedAddress) =>
      savedAddress.street === address.street &&
      savedAddress.city === address.city &&
      savedAddress.state === address.state &&
      savedAddress.zip === (address.zipCode ?? ''),
    );
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
        deliveryMethod: 1,
        paymentMethod: payment.method === 'wallet' ? 2 : 1,
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
