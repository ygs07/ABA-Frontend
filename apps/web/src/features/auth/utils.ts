import { User } from './types';

/**
 * Returns true if the user is a merchant whose account/KYC is currently under review
 * (i.e. merchant onboarding status is not 3: Approved).
 *
 * This applies to merchants alone. Admins, staff, customers, and marketers return false.
 */
export function isMerchantUnderReview(user: User | null | undefined): boolean {
  if (!user) return false;
  const isMerchant = user.userType === 'Merchant' || user.roles?.includes('Merchant');
  if (!isMerchant) return false;

  // Status 3 is Approved. Any other status (1: Submitted, 2: Under review, 4: Needs attention, or undefined)
  // indicates that admin KYC verification has not yet been completed.
  return user.merchantOnboardingStatus !== 3;
}

/**
 * Checks whether an ERP path is permitted for a merchant whose account is under review.
 * Minimal access allows:
 * - /erp/dashboard
 * - /erp/onboarding
 * - /erp/storefront/profile
 * - /erp/products (and subpaths, for preparing catalog drafts)
 * - /erp/account (profile, sessions, security)
 */
export function isAllowedPathForMerchantUnderReview(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  const normalized = pathname.toLowerCase();

  return (
    normalized === '/erp/dashboard' ||
    normalized.startsWith('/erp/onboarding') ||
    normalized.startsWith('/erp/storefront/profile') ||
    normalized.startsWith('/erp/products') ||
    normalized.startsWith('/erp/account')
  );
}
