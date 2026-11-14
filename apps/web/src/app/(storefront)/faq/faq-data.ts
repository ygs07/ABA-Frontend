export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export type FaqCategory =
  | 'Orders & Delivery'
  | 'Payments & Wallet'
  | 'Referrals & Commissions'
  | 'Merchants & Selling'
  | 'Account & Security';

export const FAQ_CATEGORIES: FaqCategory[] = [
  'Orders & Delivery',
  'Payments & Wallet',
  'Referrals & Commissions',
  'Merchants & Selling',
  'Account & Security',
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'order-place',
    category: 'Orders & Delivery',
    question: 'How do I place an order on BuyNaija?',
    answer:
      'Browse products on the storefront, add your preferred variants to your cart, and proceed to checkout. You can select a saved Nigerian delivery address or add a new one, choose a delivery method, optionally apply a referral code, and complete payment.',
  },
  {
    id: 'order-delivery-options',
    category: 'Orders & Delivery',
    question: 'What delivery methods and locations are supported?',
    answer:
      'Checkout supports Standard Delivery, Express Delivery, and Pickup where available. Delivery addresses support all 36 Nigerian states and FCT (Abuja). You can manage multiple saved addresses in your Customer Portal profile.',
  },
  {
    id: 'order-track',
    category: 'Orders & Delivery',
    question: 'How can I track my order after checkout?',
    answer:
      'After placing an order, you receive an order number (such as ORD-...). Visit the Track Order page or open Orders in your Customer Portal (/portal/orders) to view live order status, items, and payment confirmation.',
  },
  {
    id: 'payment-methods',
    category: 'Payments & Wallet',
    question: 'What payment methods are accepted at checkout?',
    answer:
      'You can pay using a debit/credit card through the payment gateway or pay directly from your Wallet balance. If you have Shopping Credits available, you can also toggle them at checkout to offset your order total.',
  },
  {
    id: 'wallet-how',
    category: 'Payments & Wallet',
    question: 'How does the Wallet and Shopping Credit balance work?',
    answer:
      'Your Wallet holds funds you can spend at checkout or withdraw through your portal, while Shopping Credits are promotional or reward balances applied toward eligible purchases. You can view balances and transaction history in your Customer Portal (/portal/wallet).',
  },
  {
    id: 'payment-failed',
    category: 'Payments & Wallet',
    question: 'What happens if my card payment fails or is interrupted?',
    answer:
      'If a payment is not completed, the order remains pending or unpaid until payment is confirmed. Check your order status in /portal/orders or contact support with your order number before retrying so you are not charged twice.',
  },
  {
    id: 'referral-apply',
    category: 'Referrals & Commissions',
    question: 'How do I apply a referral code or support a marketer at checkout?',
    answer:
      'During the Review & Pay step at checkout, search for a marketer by name or referral code in the Referral section, select the matching marketer, and confirm before placing your order.',
  },
  {
    id: 'referral-earn',
    category: 'Referrals & Commissions',
    question: 'How do referral commissions and rewards work?',
    answer:
      'Members and marketers can share their referral code or link from the Referrals portal. When referred customers place qualifying orders, commissions are calculated according to the active commission plan rules (trigger, level rates, and approval mode) and credited once approved.',
  },
  {
    id: 'merchant-apply',
    category: 'Merchants & Selling',
    question: 'How do I become a merchant on BuyNaija?',
    answer:
      'Click Sell or visit the Merchant Onboarding page (/merchants/onboarding) to submit your business details, store location, and required KYC documents for review.',
  },
  {
    id: 'merchant-review',
    category: 'Merchants & Selling',
    question: 'What can I access while my merchant account is under review?',
    answer:
      'While your KYC and onboarding application are under review by an administrator, your merchant dashboard access is intentionally limited to onboarding status and essential account views. Full merchant tools (products, orders, inventory, and settlements) unlock automatically once your account is approved.',
  },
  {
    id: 'account-addresses',
    category: 'Account & Security',
    question: 'How do I update my profile or saved delivery addresses?',
    answer:
      'Sign in and open /portal/profile to add, edit, or delete saved delivery addresses across Nigerian states, or manage your account details.',
  },
  {
    id: 'account-kyc',
    category: 'Account & Security',
    question: 'Why is KYC verification required?',
    answer:
      'KYC verification helps protect buyers and merchants across the marketplace, ensures compliant payouts and settlements, and verifies legitimate store ownership before full merchant privileges are enabled.',
  },
];
