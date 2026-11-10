import { brand } from '@/config/brand';
import { Order } from '../types';
import { API_MODE, fetchApi } from '@/lib/api';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-10482',
    createdAt: '2026-09-30T10:30:00Z',
    updatedAt: '2026-09-30T10:30:00Z',
    amountRefunded: 0,
    customerId: 'cus-1',
    customerName: 'Aisha Bello',
    customerPhone: '+2348012345678',
    merchantId: 'mer-1',
    merchantName: `${brand.name} HQ Store`,
    channel: 'Admin',
    status: 'Pending',
    paymentStatus: 'Unpaid',
    fulfilmentStatus: 'Unfulfilled',
    subtotal: 15000000, // 150,000 NGN
    discountTotal: 0,
    taxTotal: 1125000,
    deliveryFee: 500000,
    totalAmount: 16625000,
    amountPaid: 0,
    balanceDue: 16625000,
    deliveryMethod: 'Delivery',
    deliveryAddress: '15 Victoria Island, Lagos',
    lines: [
      {
        id: 'ol-1',
        productId: 'prod-1',
        productName: 'Premium Sofa Set',
        sku: 'FURN-SOF-01',
        quantity: 1,
        unitPrice: 15000000,
        discount: 0,
        tax: 1125000,
        lineTotal: 16125000,
        fulfilledQty: 0,
        returnedQty: 0
      }
    ]
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-10483',
    createdAt: '2026-09-30T11:15:00Z',
    updatedAt: '2026-09-30T11:15:00Z',
    amountRefunded: 0,
    customerName: 'Walk-in Customer',
    merchantId: 'mer-2',
    merchantName: 'Ikeja Branch POS',
    channel: 'POS',
    status: 'Completed',
    paymentStatus: 'Paid',
    fulfilmentStatus: 'Fulfilled',
    subtotal: 2500000,
    discountTotal: 0,
    taxTotal: 187500,
    deliveryFee: 0,
    totalAmount: 2687500,
    amountPaid: 2687500,
    balanceDue: 0,
    deliveryMethod: 'Pickup',
    lines: [
      {
        id: 'ol-2',
        productId: 'prod-5',
        productName: 'Office Chair (Ergo)',
        sku: 'FURN-CHR-99',
        quantity: 1,
        unitPrice: 2500000,
        discount: 0,
        tax: 187500,
        lineTotal: 2687500,
        fulfilledQty: 1,
        returnedQty: 0
      }
    ]
  }
];

type BackendOrder = {
  id: number;
  order_number: string;
  total_amount: string | number;
  status: string;
  delivery_method: string;
  createdAt: string;
  updatedAt: string;
  customer?: { user?: { first_name?: string; last_name?: string; phone?: string } };
  deliveryAddress?: { street?: string; city?: string; state?: string };
  payment_method?: number;
  payments?: Array<{ status?: string; amount?: string | number }>;
  items: Array<{
    id: number;
    quantity: number;
    unit_price: string | number;
    total_price: string | number;
    status?: string;
    productVariant?: {
      product_id?: number;
      name?: string;
      sku?: string;
      merchant_id?: number | null;
      merchant?: { id?: number; business_name?: string };
      product?: { name?: string };
    };
  }>;
};

function amountInKobo(amount: string | number | undefined): number {
  return Math.round(Number(amount ?? 0) * 100);
}

function presentOrder(order: BackendOrder): Order {
  const totalAmount = amountInKobo(order.total_amount);
  const amountPaid = order.payments
    ?.filter((payment) => payment.status === 'successful')
    .reduce((total, payment) => total + amountInKobo(payment.amount), 0) ?? 0;
  const firstItem = order.items[0]?.productVariant;
  const customer = order.customer?.user;
  const status = String(order.status).toLowerCase();
  const fulfilmentStatus = status === 'complete'
    ? 'Fulfilled'
    : status === 'cancelled'
      ? 'Returned'
      : 'Unfulfilled';

  return {
    id: String(order.id),
    orderNumber: order.order_number,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customerName: [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || 'Customer',
    customerPhone: customer?.phone,
    merchantId: String(firstItem?.merchant_id ?? ''),
    merchantName: firstItem?.merchant?.business_name ?? `${brand.name} Merchant`,
    channel: 'Web',
    status: toOrderStatus(status),
    paymentStatus: totalAmount === 0 || amountPaid >= totalAmount ? 'Paid' : 'Unpaid',
    paymentMethod: order.payment_method === 2 ? 'Wallet' : 'Card / Bank',
    fulfilmentStatus,
    lines: order.items.map((item) => ({
      id: String(item.id),
      productId: String(item.productVariant?.product_id ?? ''),
      productName: item.productVariant?.product?.name ?? item.productVariant?.name ?? 'Product',
      sku: item.productVariant?.sku ?? '',
      quantity: item.quantity,
      unitPrice: amountInKobo(item.unit_price),
      discount: 0,
      tax: 0,
      lineTotal: amountInKobo(item.total_price),
      fulfilledQty: fulfilmentStatus === 'Fulfilled' ? item.quantity : 0,
      returnedQty: fulfilmentStatus === 'Returned' ? item.quantity : 0,
      status: item.status,
    })),
    subtotal: totalAmount,
    discountTotal: 0,
    taxTotal: 0,
    deliveryFee: 0,
    totalAmount,
    amountPaid,
    balanceDue: Math.max(totalAmount - amountPaid, 0),
    amountRefunded: 0,
    deliveryMethod: order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery',
    deliveryAddress: [order.deliveryAddress?.street, order.deliveryAddress?.city, order.deliveryAddress?.state]
      .filter(Boolean)
      .join(', '),
  };
}

function toOrderStatus(status: string): Order['status'] {
  if (status === 'processing') return 'Processing';
  if (status.includes('shipped') || status.includes('pickup')) return 'Shipped / Ready for pickup';
  if (status === 'complete') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  if (status.includes('refund')) return 'Refunded';
  return 'Pending';
}

export const getOrders = async (): Promise<Order[]> => {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: BackendOrder[] }>('/api/v1/orders?limit=100');
    return response.data.map(presentOrder);
  }
  await delay(800);
  return MOCK_ORDERS;
};

export const getOrderById = async (id: string): Promise<Order> => {
  if (API_MODE !== 'mock') {
    const order = await fetchApi<BackendOrder>(`/api/v1/orders/id/${encodeURIComponent(id)}`);
    return presentOrder(order);
  }
  await delay(500);
  const order = MOCK_ORDERS.find(o => o.id === id || o.orderNumber === id);
  if (!order) throw new Error('Not found');
  return order;
};

export const downloadOrderInvoice = async (orderId: string): Promise<void> => {
  if (API_MODE === 'mock') return;
  const response = await fetch(`/api/v1/invoices/orders/${encodeURIComponent(orderId)}/download`, { credentials: 'include' });
  if (!response.ok) {
    const payload = await response.json().catch(() => undefined) as { message?: string } | undefined;
    throw new Error(payload?.message ?? 'Unable to download the invoice.');
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
};

export const updateOrderStatus = async (
  id: string,
  status: number,
): Promise<Order> => {
  if (API_MODE === 'mock') {
    const order = await getOrderById(id);
    const nextStatus: Order['status'] = status === 2
      ? 'Processing'
      : status === 3
        ? 'Shipped / Ready for pickup'
        : status === 4
          ? 'Completed'
          : status === 5
            ? 'Cancelled'
            : status === 6
              ? 'Refunded'
              : 'Pending';
    return { ...order, status: nextStatus };
  }
  const order = await fetchApi<BackendOrder>(`/api/v1/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return presentOrder(order);
};

export const updateOrderItem = async (
  orderId: string,
  itemId: string,
  data: { quantity?: number; status?: number },
): Promise<Order> => {
  if (API_MODE === 'mock') {
    const order = await getOrderById(orderId);
    return {
      ...order,
      lines: order.lines.map((line) =>
        line.id === itemId
          ? { ...line, ...(data.quantity ? { quantity: data.quantity } : {}) }
          : line,
      ),
    };
  }
  const order = await fetchApi<BackendOrder>(
    `/api/v1/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );
  return presentOrder(order);
};
