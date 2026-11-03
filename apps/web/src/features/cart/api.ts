import { API_MODE, ApiError, fetchApi } from '@/lib/api';
import { Cart, CartItem } from './types';
import { mockCart } from './mocks';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type BackendCart = {
  id: number;
  subtotal?: string;
  items: Array<{
    id: number;
    quantity: number;
    product_variant_id: number;
    productVariant: {
      id: number;
      name: string;
      price: string | number;
      on_sale_price?: string | number | null;
      is_on_sale?: boolean;
      product?: {
        id: number;
        name: string;
        images?: Array<{ url: string }>;
        merchant?: { id: number; business_name: string } | null;
      };
    };
  }>;
};

export type CartAvailability = {
  is_available: boolean;
  items: Array<{
    cart_item_id: number;
    product_variant_id: number;
    requested_quantity: number;
    available_quantity: number;
    is_available: boolean;
  }>;
};

function toCart(cart: BackendCart): Cart {
  const items = cart.items.map((item) => {
    const product = item.productVariant.product;
    const priceInNaira = Number(
      item.productVariant.is_on_sale && item.productVariant.on_sale_price !== null
        ? item.productVariant.on_sale_price
        : item.productVariant.price,
    );
    return {
      id: String(item.id),
      productId: String(product?.id ?? item.product_variant_id),
      productVariantId: String(item.product_variant_id),
      productName: product?.name ?? item.productVariant.name,
      productImage: product?.images?.[0]?.url ?? '',
      merchantId: String(product?.merchant?.id ?? ''),
      merchantName: product?.merchant?.business_name ?? 'Merchant',
      price: priceInNaira * 100,
      quantity: item.quantity,
    };
  });
  const subtotal = cart.subtotal !== undefined
    ? Number(cart.subtotal) * 100
    : items.reduce((total, item) => total + item.price * item.quantity, 0);
  return {
    id: String(cart.id),
    items,
    subtotal,
    deliveryFee: 0,
    total: subtotal,
  };
}

export async function getCart(): Promise<{ data: Cart }> {
  if (API_MODE !== 'mock') {
    const cart = await fetchApi<BackendCart>('/api/v1/cart/me');
    return { data: toCart(cart) };
  }
  await delay(400);
  return { data: mockCart };
}

export async function getCartAvailability(): Promise<CartAvailability> {
  if (API_MODE !== 'mock') {
    return fetchApi<CartAvailability>('/api/v1/cart/availability');
  }
  return {
    is_available: true,
    items: [],
  };
}

export async function addToCart(item: Omit<CartItem, 'id'>): Promise<{ data: Cart }> {
  if (API_MODE !== 'mock') {
    const productVariantId = Number(item.productVariantId ?? item.productId);
    if (!Number.isInteger(productVariantId) || productVariantId < 1) {
      throw new ApiError(400, 'A valid product variant is required', 'BAD_REQUEST');
    }
    const cart = await fetchApi<BackendCart>('/api/v1/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productVariantId, quantity: item.quantity }),
    });
    return { data: toCart(cart) };
  }
  await delay(500);
  // Simulate adding item
  return { data: mockCart };
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<{ data: Cart }> {
  if (API_MODE !== 'mock') {
    const cart = await fetchApi<BackendCart>(`/api/v1/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    return { data: toCart(cart) };
  }
  await delay(300);
  if (quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1', 'BAD_REQUEST');
  }
  return { data: mockCart };
}

export async function removeFromCart(itemId: string): Promise<{ data: Cart }> {
  if (API_MODE !== 'mock') {
    await fetchApi<void>(`/api/v1/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
    return getCart();
  }
  await delay(300);
  return { data: mockCart };
}

export async function clearCart(): Promise<{ data: Cart }> {
  if (API_MODE !== 'mock') {
    await fetchApi<void>('/api/v1/cart', { method: 'DELETE' });
    return getCart();
  }
  await delay(300);
  return { data: { ...mockCart, items: [], subtotal: 0, deliveryFee: 0, total: 0 } };
}
