export interface CheckoutSession {
  id: string;
  status: 'active' | 'completed' | 'failed';
  totalAmount: number;
  createdAt: string;
}

export interface OrderDeliveryAddress {
  id?: number;
  customer_id?: number;
  name?: string;
  street: string;
  city: string;
  state?: string;
  zip?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderPayment {
  id: number;
  order_id: number;
  payment_type: string;
  source_type?: string;
  source_id?: number;
  payment_gateway_id?: number | null;
  reference: string;
  gateway_transaction_id?: string | null;
  amount: string | number;
  currency: string;
  status: string;
  payment_method: string;
  paid_at?: string | null;
  metadata?: Record<string, unknown> | null;
  failure_reason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderProductImage {
  id: number;
  url: string;
  original_name?: string;
}

export interface OrderProduct {
  id: number;
  category_id?: number | null;
  subcategory_id?: number | null;
  name: string;
  slug?: string;
  description?: string | null;
  brand_id?: number | null;
  is_active?: boolean;
  base_cost_price?: string | number | null;
  base_selling_price?: string | number | null;
  base_unit_of_measurement?: string | null;
  type?: number | null;
  reorder_level?: number | null;
  reorder_quantity?: number | null;
  merchant_id?: number | null;
  images?: OrderProductImage[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface OrderProductVariant {
  id: number;
  product_id: number;
  merchant_id?: number;
  name?: string;
  sku?: string;
  barcode?: string | null;
  price?: string | number;
  is_on_sale?: boolean;
  on_sale_price?: string | number | null;
  cost_price?: string | number | null;
  variant_cost_price?: string | number | null;
  variant_selling_price?: string | number;
  weight?: string | number | null;
  attributes?: Record<string, unknown> | null;
  is_active?: boolean;
  product?: OrderProduct;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_variant_id: number;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  status?: string;
  productVariant?: OrderProductVariant;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderDetail {
  id: number;
  customer_id?: number;
  delivery_address_id?: number | null;
  delivery_method?: string;
  delivery_cost?: string | number;
  payment_method?: number | string;
  order_number: string;
  total_amount: string | number;
  status: string;
  referral_code_id?: number | null;
  referring_marketer_id?: number | null;
  deliveryAddress?: OrderDeliveryAddress | null;
  referralCode?: Record<string, unknown> | null;
  payments?: OrderPayment[];
  items?: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}
