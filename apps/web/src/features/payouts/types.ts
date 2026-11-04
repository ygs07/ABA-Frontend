export type PayoutSource = 'Commission' | 'Wallet' | 'Merchant Settlement' | 'Other';
export type PayoutStatus = 'Pending' | 'Approved' | 'Processing' | 'Paid' | 'Failed' | 'Rejected' | 'Cancelled' | 'On Hold';

export interface PayoutRequest {
  id: string;
  payoutNumber: string;
  requestedDate: string;
  payeeName: string;
  payeeType: 'Referrer' | 'Customer' | 'Merchant' | 'Staff';
  source: PayoutSource;
  amount: number; // in kobo
  fee: number; // in kobo
  netAmount: number; // in kobo
  destinationBank: string;
  destinationAccount: string;
  status: PayoutStatus;
  approvedBy?: string;
  batchId?: string;
  notes?: string;
}

export interface PayoutBatch {
  id: string;
  batchNumber: string;
  createdDate: string;
  totalAmount: number;
  requestCount: number;
  status: 'Draft' | 'Approved' | 'Processing' | 'Completed' | 'Partially Failed';
}

export interface PayoutSettings {
  minAmount: number;
  dailyLimit: number;
  schedule: 'On request' | 'Weekly Friday' | 'Monthly';
  feeRule: string;
  autoApproveBelow: number;
  requiredKycLevel: number;
  holdingPeriodDays: number;
  enforceNameMatching: boolean;
}
