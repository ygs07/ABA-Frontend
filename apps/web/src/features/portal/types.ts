export interface PortalOrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface PortalShippingAddress {
  fullName: string;
  street: string;
  city: string;
  zipCode?: string;
  phone: string;
}

export interface PortalOrder {
  id: string;
  backendId?: number;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: PortalOrderItem[];
  shippingAddress: PortalShippingAddress;
  paymentMethod: string;
}

export interface PortalWalletTransaction {
  id: string;
  type: 'commission' | 'purchase' | 'withdrawal' | 'funding';
  title: string;
  date: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed';
}

export interface PortalReferralStat {
  referredUserId: string;
  referredUserName: string;
  joinedDate: string;
  status: 'Active' | 'Pending Purchase';
  earnings: number;
}
