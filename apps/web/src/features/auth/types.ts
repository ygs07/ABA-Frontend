export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Customer'
  | 'Merchant'
  | 'Vendor'
  | 'Marketer'
  // Legacy UI roles retained while their backend mappings are finalized.
  | 'Merchant user'
  | 'Auditor'
  | 'Staff';
export type UserStatus = 'Invited' | 'Active' | 'Suspended' | 'Locked' | 'Deactivated';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  roles: UserRole[];
  userType?: UserRole;
  status: UserStatus;
  merchantId?: string;
  referralCode?: string;
  merchantOnboardingStatus?: number;
  merchantOnboardingRejectionReason?: string | null;
  twoFactorEnabled: boolean;
  lastActive?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrentDevice: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
  requires2FA?: boolean;
}
