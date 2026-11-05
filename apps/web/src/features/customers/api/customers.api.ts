import { Customer } from '../types';
import { CreateCustomerInput } from '../schemas';
import { API_MODE, fetchApi } from '@/lib/api';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cus-1',
    customerNo: 'CUS-1001',
    type: 'Individual',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+2348012345678',
    email: 'john@example.com',
    customerGroup: 'Retail',
    referralCode: 'JD1001',
    addresses: [],
    creditLimit: 0,
    status: 'Active',
    registeredAt: '2026-09-01T10:00:00Z',
    ordersCount: 5,
    totalSpent: 12500000, // In kobo
    walletBalance: 500000,
    referralsCount: 2,
  },
  {
    id: 'cus-2',
    customerNo: 'CUS-1002',
    type: 'Business',
    firstName: 'Jane',
    lastName: 'Smith',
    companyName: 'Smith & Co',
    phone: '+2348087654321',
    customerGroup: 'Wholesale',
    referralCode: 'JS1002',
    addresses: [],
    creditLimit: 50000000,
    status: 'Active',
    registeredAt: '2026-09-10T10:00:00Z',
    ordersCount: 12,
    totalSpent: 450000000,
    walletBalance: 0,
    referralsCount: 0,
  }
];

export const getCustomers = async (): Promise<Customer[]> => {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: Array<{
      id: number;
      status: 'active' | 'inactive';
      createdAt: string;
      user: {
        id: number;
        first_name: string;
        last_name: string;
        phone?: string | null;
        email: string;
        username?: string;
      };
      ordersCount?: number;
      totalSpent?: string | number;
      walletBalance?: string | number;
      deliveryAddresses?: Array<{ id: number; name: string; street: string; city: string; state: string }>;
      orders?: Array<{ id: number; order_number: string; total_amount: string | number; status: string | number; createdAt: string; items: Array<unknown>; payments: Array<{ id: number; reference: string; amount: string | number; status: string; payment_method: string | null; paid_at: string | null; createdAt: string }> }>;
    }>; meta: unknown }>('/api/v1/customers?limit=100');
    return response.data.map((customer) => ({
      id: String(customer.id),
      customerNo: `CUS-${String(customer.id).padStart(5, '0')}`,
      type: 'Individual',
      firstName: customer.user.first_name,
      lastName: customer.user.last_name,
      phone: customer.user.phone ?? '',
      email: customer.user.email,
      customerGroup: 'Retail',
      referralCode: customer.user.username ?? '',
      addresses: (customer.deliveryAddresses ?? []).map((address) => ({ id: String(address.id), label: address.name, street: address.street, city: address.city, state: address.state, lga: '', isDefault: false })),
      creditLimit: 0,
      status: customer.status === 'active' ? 'Active' : 'Suspended',
      registeredAt: customer.createdAt,
      ordersCount: Number(customer.ordersCount ?? 0),
      totalSpent: Math.round(Number(customer.totalSpent ?? 0) * 100),
      walletBalance: Math.round(Number(customer.walletBalance ?? 0) * 100),
      referralsCount: 0,
      orders: (customer.orders ?? []).map((order) => ({ id: String(order.id), orderNumber: order.order_number, total: Math.round(Number(order.total_amount) * 100), status: order.status, createdAt: order.createdAt, itemCount: order.items.length, payments: order.payments.map((payment) => ({ id: String(payment.id), reference: payment.reference, amount: Math.round(Number(payment.amount) * 100), status: payment.status, method: payment.payment_method, paidAt: payment.paid_at, createdAt: payment.createdAt })) })),
    }));
  }
  await delay(800);
  return MOCK_CUSTOMERS;
};

export type CustomerOverview = {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomersLast90Days: number;
  customersWithReferrals: number;
};

export const getCustomerOverview = async (): Promise<CustomerOverview> => {
  if (API_MODE !== 'mock') {
    return fetchApi<CustomerOverview>('/api/v1/customers/overview');
  }

  return {
    totalCustomers: MOCK_CUSTOMERS.length,
    newCustomersThisMonth: 0,
    activeCustomersLast90Days: 0,
    customersWithReferrals: 0,
  };
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  if (API_MODE !== 'mock') {
    const customer = await fetchApi<{
      id: number;
      status: 'active' | 'inactive';
      createdAt: string;
      user: {
        id: number;
        first_name: string;
        last_name: string;
        phone?: string | null;
        email: string;
        username?: string;
      };
      ordersCount?: number;
      totalSpent?: string | number;
      walletBalance?: string | number;
      deliveryAddresses?: Array<{
        id: number;
        name: string;
        street: string;
        city: string;
        state: string;
      }>;
      orders?: Array<{
        id: number;
        order_number: string;
        total_amount: string | number;
        status: number;
        createdAt: string;
        items?: Array<unknown>;
        payments?: Array<{
          id: number;
          reference: string;
          amount: string | number;
          status: string;
          payment_method: string | null;
          paid_at: string | null;
          createdAt: string;
        }>;
      }>;
    }>(`/api/v1/customers/${encodeURIComponent(id)}`);
    const orderStatuses: Record<number, string> = {
      1: 'Pending',
      2: 'Processing',
      3: 'Shipped / Ready for pickup',
      4: 'Complete',
      5: 'Cancelled',
      6: 'Refund requested',
    };
    return {
      id: String(customer.id),
      customerNo: `CUS-${String(customer.id).padStart(5, '0')}`,
      type: 'Individual',
      firstName: customer.user.first_name,
      lastName: customer.user.last_name,
      phone: customer.user.phone ?? '',
      email: customer.user.email,
      customerGroup: 'Retail',
      referralCode: customer.user.username ?? '',
      addresses: (customer.deliveryAddresses ?? []).map((address) => ({
        id: String(address.id),
        label: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        lga: '',
        isDefault: false,
      })),
      creditLimit: 0,
      status: customer.status === 'active' ? 'Active' : 'Suspended',
      registeredAt: customer.createdAt,
      ordersCount: Number(customer.ordersCount ?? 0),
      totalSpent: Math.round(Number(customer.totalSpent ?? 0) * 100),
      walletBalance: Math.round(Number(customer.walletBalance ?? 0) * 100),
      referralsCount: 0,
      orders: (customer.orders ?? []).map((order) => ({
        id: String(order.id),
        orderNumber: order.order_number,
        total: Math.round(Number(order.total_amount) * 100),
        status: orderStatuses[order.status] ?? 'Unknown',
        createdAt: order.createdAt,
        itemCount: order.items?.length ?? 0,
        payments: (order.payments ?? []).map((payment) => ({
          id: String(payment.id),
          reference: payment.reference,
          amount: Math.round(Number(payment.amount) * 100),
          status: payment.status,
          method: payment.payment_method,
          paidAt: payment.paid_at,
          createdAt: payment.createdAt,
        })),
      })),
    };
  }
  await delay(500);
  const customer = MOCK_CUSTOMERS.find(c => c.id === id);
  if (!customer) throw new Error('Customer not found');
  return customer;
};

export const createCustomer = async (data: CreateCustomerInput): Promise<Customer> => {
  await delay(1000);
  if (data.phone === '+2348000000000') throw new Error('Customer with this phone exists');

  const newCustomer: Customer = {
    id: `cus-${Date.now()}`,
    customerNo: `CUS-${Math.floor(Math.random() * 9000) + 1000}`,
    type: data.type,
    firstName: data.firstName,
    lastName: data.lastName,
    companyName: data.companyName,
    phone: data.phone,
    email: data.email,
    customerGroup: data.customerGroup,
    merchantId: data.merchantId,
    referredBy: data.referredBy,
    referralCode: `REF-${Math.floor(Math.random() * 9000)}`,
    addresses: data.addresses?.map(a => ({ id: `add-${Date.now()}`, ...a })) || [],
    creditLimit: data.creditLimit,
    notes: data.notes,
    status: 'Active',
    registeredAt: new Date().toISOString(),
    ordersCount: 0,
    totalSpent: 0,
    walletBalance: 0,
    referralsCount: 0,
  };

  MOCK_CUSTOMERS.unshift(newCustomer);
  return newCustomer;
};
