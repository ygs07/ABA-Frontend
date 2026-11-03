export interface CartItem {
  id: string;
  productId: string;
  productVariantId?: string;
  productName: string;
  productImage: string;
  merchantId: string;
  merchantName: string;
  price: number;
  quantity: number;
  attributes?: Record<string, string>;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
