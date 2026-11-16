# Storefront and Customer Portal Audit

## Routes Audit

### `/(storefront)/page.tsx`

- **Renders**: `StorefrontHome`
- **Status**: Complete
- **Components**: Button
- **Data Source**: Hardcoded

### `/(storefront)/layout.tsx`

- **Renders**: `StorefrontLayout`
- **Status**: Stub
- **Components**: StorefrontFooter, StorefrontHeader
- **Data Source**: Hardcoded

### `/(storefront)/shop/page.tsx`

- **Renders**: `ProductListingPage`
- **Status**: Partial
- **Components**: ProductCard, Button
- **Data Source**: API

### `/(storefront)/products/[id]/page.tsx`

- **Renders**: `ProductDetailPage`
- **Status**: Complete
- **Components**: ErrorState, Button, AddToCartButton, Alert, AmountText
- **Data Source**: API

### `/(storefront)/cart/page.tsx`

- **Renders**: `CartPage`
- **Status**: Complete
- **Components**: AmountText, Button
- **Data Source**: Hardcoded

### `/(storefront)/checkout/page.tsx`

- **Renders**: `CheckoutPage`
- **Status**: Complete
- **Components**: AmountText, Button, Alert
- **Data Source**: API

### `/(storefront)/checkout/success/page.tsx`

- **Renders**: `OrderSuccessPage`
- **Status**: Complete
- **Components**: Button
- **Data Source**: Hardcoded

### `/(storefront)/merchants/page.tsx`

- **Renders**: `MerchantDirectoryPage`
- **Status**: Partial
- **Components**: ErrorState, Button, Alert
- **Data Source**: API

### `/(storefront)/merchants/[id]/page.tsx`

- **Renders**: `MerchantProfilePage`
- **Status**: Partial
- **Components**: ProductCard, ErrorState, Button
- **Data Source**: API

### `/(storefront)/merchants/onboarding/page.tsx`

- **Renders**: `MerchantOnboarding`
- **Status**: Partial
- **Components**: Button, Alert
- **Data Source**: Hardcoded

### `/(storefront)/auth/login/page.tsx`

- **Renders**: `StorefrontLoginPage`
- **Status**: Partial
- **Components**: Button
- **Data Source**: Mocked

### `/(storefront)/auth/register/page.tsx`

- **Renders**: `StorefrontRegisterPage`
- **Status**: Partial
- **Components**: Button
- **Data Source**: Mocked

### `/(storefront)/portal/layout.tsx`

- **Renders**: `PortalLayout`
- **Status**: Complete
- **Components**: None
- **Data Source**: Hardcoded

### `/(storefront)/portal/dashboard/page.tsx`

- **Renders**: `PortalDashboard`
- **Status**: Complete
- **Components**: AmountText, Button, Alert
- **Data Source**: API

### `/(storefront)/portal/profile/page.tsx`

- **Renders**: `PortalProfile`
- **Status**: Partial
- **Components**: Button
- **Data Source**: Hardcoded

### `/(storefront)/portal/wallet/page.tsx`

- **Renders**: `PortalWalletPage`
- **Status**: Partial
- **Components**: AmountText, Button, Alert
- **Data Source**: API

### `/(storefront)/portal/orders/page.tsx`

- **Renders**: `PortalOrdersPage`
- **Status**: Partial
- **Components**: AmountText, Button, Alert
- **Data Source**: API

### `/(storefront)/portal/orders/[id]/page.tsx`

- **Renders**: `OrderDetailsPage`
- **Status**: Complete
- **Components**: AmountText, Button, Alert
- **Data Source**: API

### `/(storefront)/portal/referrals/page.tsx`

- **Renders**: `PortalReferralsPage`
- **Status**: Complete
- **Components**: AmountText, Button, Alert
- **Data Source**: API

### `/(storefront)/portal/referrals/leaderboard/page.tsx`

- **Renders**: `LeaderboardPage`
- **Status**: Partial
- **Components**: AmountText, Button
- **Data Source**: Mocked

### `/(storefront)/portal/notifications/page.tsx`

- **Renders**: `PortalNotifications`
- **Status**: Complete
- **Components**: Button
- **Data Source**: Hardcoded

## Branding Occurrences ("ABA" or "Aba")

Mentions of "ABA" or "Aba" were found in the following locations across the workspace:

- **Components & Layouts**: `StorefrontFooter.tsx`, `StorefrontHeader.tsx` (e.g. `BuyNaija`, logo alt text), `Sidebar.tsx`, `layout.tsx` (title/desc: `Aba E-commerce`)
- **Pages**: `(storefront)/page.tsx` (e.g. `What is BuyNaija?`, `Made in Aba`, `Built by Aba. Growing with Aba.`), `(storefront)/cart/page.tsx` (`Secure Checkout Powered by BuyNaija`), `(storefront)/merchants/onboarding/page.tsx`, `(storefront)/merchants/page.tsx`, `(storefront)/products/[id]/page.tsx` (`ABA Buyer Protection`), `(storefront)/auth/register/page.tsx`, `(storefront)/auth/login/page.tsx`
- **Mock Data**: `features/merchant/mocks.ts` (e.g. `ABA Retail Ltd`), `features/referrals/mocks.ts` (Referral IDs starting with `ABA-`), `services/mock/public.service.ts` (`Aba Leather Satchel`, `Aba Crafts`, `Aba Textiles`)
- **Docs**: `docs/blueprint.md` (`ABA ERP Mobile Blueprint`), `docs/review/ABA-Client-Feedback-Implementation-Guide.md`, `docs/spec/ABA-ERP-06-Storefront-and-Marketplace.md`
- **Other Code**: `features/referrals/components/NetworkExplorer.tsx`, `store/useAuthStore.ts`, `components/merchant/POSInterface.tsx`, `components/public/home/ServicesSection.tsx`, `app/(public)/about/page.tsx`

## Header and Navigation Structure

The main navigation is defined in `StorefrontHeader.tsx` and features a desktop and mobile variant:

- **Logo**: "BuyNaija" logo linking to `/`
- **Navigation Links**:
  - `Home` (`/`)
  - `Shop` (`/shop`)
  - `Merchants` (`/merchants`)
  - `Community` (`/community`)
  - `About` (`/about`)
- **Actions**:
  - Search Input (with `lucide-react` icon)
  - Cart Link (`/cart` with item count badge)
  - Auth State:
    - Logged In: Portal Link (`/portal/dashboard` showing user initials/name)
    - Logged Out: `Log in` (`/auth/login`) and `Register` (`/auth/register`) buttons

## Categories Data Model

Categories are modeled in `features/category/types.ts` as:

```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}
```

## Products, Images and Variants Data Model

Products are modeled in `features/products/types.ts`.

- **Images**: Modeled as an array of strings on the base `Product` type (`images: string[]`). A variant can also have an optional `imageUrl: string`.
- **Variants**: Modeled via a `hasVariants: boolean` flag and an array of `ProductVariant` objects on the product:

```typescript
export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  cost: number;
  price: number;
  reorderLevel: number;
  imageUrl?: string;
  isActive: boolean;
  stockCount: number;
}
```

## Large Files (Over 250 lines)

The following source files exceed 250 lines:

- `apps/web/src/app/(erp)/erp/suppliers/[id]/page.tsx` (293 lines)
- `apps/web/src/app/(erp)/erp/merchants/[id]/page.tsx` (308 lines)
- `apps/web/src/app/(erp)/erp/orders/new/page.tsx` (278 lines)
- `apps/web/src/app/(storefront)/portal/referrals/page.tsx` (254 lines)
- `apps/web/src/app/(storefront)/checkout/page.tsx` (371 lines)
- `apps/web/src/app/(storefront)/merchants/onboarding/page.tsx` (335 lines)
- `apps/web/src/app/(storefront)/page.tsx` (279 lines)
- `apps/web/src/features/shop/mocks.ts` (845 lines)
- `apps/web/src/components/patterns/Sidebar.tsx` (314 lines)
