import { API_MODE, ApiError, fetchApi } from '@/lib/api';
import { PortalOrder, PortalWalletTransaction, PortalReferralStat } from './types';
import { mockPortalOrders, mockPortalTransactions, mockPortalReferrals } from './mocks';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type BackendOrder = {
  id: number;
  order_number: string;
  total_amount: string | number;
  status: string | number;
  createdAt: string;
  deliveryAddress?: { name?: string; street: string; city: string; zip?: string };
  payments?: Array<{ payment_method?: string }>;
  items: Array<{
    id: number;
    quantity: number;
    unit_price: string | number;
    productVariant?: { product?: { id: number; name: string } };
  }>;
};

function toPortalOrder(order: BackendOrder): PortalOrder {
  return {
    id: order.order_number || String(order.id),
    backendId: order.id,
    date: order.createdAt,
    status: toPortalOrderStatus(order.status),
    total: Number(order.total_amount) * 100,
    items: order.items.map((item) => ({
      id: String(item.id),
      productId: String(item.productVariant?.product?.id ?? ''),
      productName: item.productVariant?.product?.name ?? 'Product',
      price: Number(item.unit_price) * 100,
      quantity: item.quantity,
    })),
    shippingAddress: {
      fullName: order.deliveryAddress?.name ?? 'Delivery address',
      street: order.deliveryAddress?.street ?? '',
      city: order.deliveryAddress?.city ?? '',
      zipCode: order.deliveryAddress?.zip,
      phone: '',
    },
    paymentMethod: order.payments?.[0]?.payment_method ?? 'Pending payment',
  };
}

export async function getCustomerOrders(): Promise<{ data: PortalOrder[] }> {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{
      data: BackendOrder[];
    }>('/api/v1/profile/orders?limit=100');
    return {
      data: response.data.map(toPortalOrder),
    };
  }
  await delay(500);
  return { data: mockPortalOrders };
}

function toPortalOrderStatus(status: string | number): PortalOrder['status'] {
  const normalizedStatus = String(status).toLowerCase();
  if (normalizedStatus.includes('process')) return 'Processing';
  if (normalizedStatus.includes('ship') || normalizedStatus.includes('pickup')) return 'Shipped';
  if (normalizedStatus.includes('complete') || normalizedStatus.includes('deliver')) return 'Delivered';
  if (normalizedStatus.includes('cancel')) return 'Cancelled';
  return 'Pending';
}

export async function getCustomerOrderById(id: string): Promise<{ data: PortalOrder }> {
  if (API_MODE !== 'mock') {
    const endpoint = /^\d+$/.test(id)
      ? `/api/v1/orders/id/${encodeURIComponent(id)}`
      : `/api/v1/orders/${encodeURIComponent(id)}`;
    const order = await fetchApi<BackendOrder>(endpoint);
    return { data: toPortalOrder(order) };
  }
  await delay(500);
  const order = mockPortalOrders.find(o => o.id === id);
  if (!order) {
    throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  }
  return { data: order };
}

export async function downloadCustomerInvoice(orderId: number): Promise<void> {
  if (API_MODE === 'mock') return;

  const response = await fetch(`/api/v1/invoices/orders/${encodeURIComponent(orderId)}/download`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => undefined) as { message?: string } | undefined;
    throw new ApiError(response.status, payload?.message ?? 'Unable to download the invoice.');
  }

  const pdfBlob = await response.blob();
  const objectUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `invoice-${orderId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function getWalletTransactions(): Promise<{ data: PortalWalletTransaction[] }> {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: BackendWalletTransaction[] }>('/api/v1/wallets/me/transactions?limit=100');
    return { data: response.data.map(toPortalWalletTransaction) };
  }
  await delay(400);
  return { data: mockPortalTransactions };
}

type BackendWalletTransaction = {
  id: number;
  reference_number: string;
  transaction_type: number;
  amount: string | number;
  status: number;
  description: string | null;
  createdAt: string;
};

function toPortalWalletTransaction(transaction: BackendWalletTransaction): PortalWalletTransaction {
  const transactionType = transaction.transaction_type;
  const isDebit = transactionType === 2 || transactionType === 3;
  const titleByType: Record<number, string> = {
    1: 'Wallet deposit',
    2: 'Order payment',
    3: 'Withdrawal',
    4: 'Refund',
  };
  const statusByValue: Record<number, PortalWalletTransaction['status']> = {
    1: 'Pending',
    2: 'Completed',
    3: 'Failed',
    4: 'Failed',
  };
  return {
    id: transaction.reference_number || String(transaction.id),
    type: transactionType === 2 ? 'purchase' : transactionType === 3 ? 'withdrawal' : transactionType === 4 ? 'funding' : 'funding',
    title: transaction.description || titleByType[transactionType] || 'Wallet transaction',
    date: transaction.createdAt,
    amount: Number(transaction.amount) * 100 * (isDebit ? -1 : 1),
    status: statusByValue[transaction.status] ?? 'Pending',
  };
}

type BackendWallet = {
  id: number;
  balance: string | number;
  currency: number;
  is_active: boolean;
};

export async function getCustomerWalletBalance(): Promise<number> {
  if (API_MODE === 'mock') return 150000000;

  const wallets = await fetchApi<BackendWallet[]>('/api/v1/wallets/me');
  return wallets
    .filter((wallet) => wallet.is_active && wallet.currency === 1)
    .reduce((total, wallet) => total + Number(wallet.balance) * 100, 0);
}

export type WalletFundingCheckout = { reference: string; email: string; amount: number; publicKey: string };

export async function initializeWalletFunding(amount: string): Promise<WalletFundingCheckout> {
  return fetchApi<WalletFundingCheckout>('/api/v1/wallets/fund/paystack/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
}

export async function verifyWalletFunding(reference: string): Promise<void> {
  await fetchApi(`/api/v1/wallets/fund/paystack/${encodeURIComponent(reference)}/verify`, { method: 'POST' });
}

export type KycActivationCheckout = { reference: string; email: string; amount: number; publicKey: string };
export async function initializeKycActivation(): Promise<KycActivationCheckout> { return fetchApi<KycActivationCheckout>('/api/v1/payments/kyc-activation/paystack/initialize', { method: 'POST' }); }
export async function verifyKycActivation(reference: string): Promise<void> { await fetchApi(`/api/v1/payments/kyc-activation/paystack/${encodeURIComponent(reference)}/verify`, { method: 'POST' }); }

export type UserBankAccount = {
  id: number;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_verified: boolean;
  is_primary: boolean;
};

export type SettlementBank = { name: string; code: string; active: boolean };

export async function getUserBankAccounts(): Promise<UserBankAccount[]> {
  const response = await fetchApi<{ data: UserBankAccount[] }>('/api/v1/user-bank-accounts?limit=100');
  return response.data;
}

export async function getSettlementBanks(): Promise<SettlementBank[]> {
  return fetchApi<SettlementBank[]>('/api/v1/user-bank-accounts/banks');
}

export async function addUserBankAccount(input: { bankName: string; bankCode: string; accountNumber: string; isPrimary: boolean }): Promise<UserBankAccount> {
  return fetchApi<UserBankAccount>('/api/v1/user-bank-accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
}

export async function setPrimaryUserBankAccount(id: number): Promise<UserBankAccount> {
  return fetchApi<UserBankAccount>(`/api/v1/user-bank-accounts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPrimary: true }) });
}

export async function removeUserBankAccount(id: number): Promise<void> {
  await fetchApi(`/api/v1/user-bank-accounts/${id}`, { method: 'DELETE' });
}

export async function getReferralStats(): Promise<{ 
  data: { 
    stats: PortalReferralStat[], 
    metrics: { totalNetwork: number, activeBuyers: number, totalEarned: number } 
  } 
}> {
  await delay(500);
  return { 
    data: {
      stats: mockPortalReferrals,
      metrics: {
        totalNetwork: 24,
        activeBuyers: 18,
        totalEarned: 4550000
      }
    } 
  };
}
