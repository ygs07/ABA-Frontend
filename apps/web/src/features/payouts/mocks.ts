import { PayoutRequest, PayoutBatch, PayoutSettings } from './types';

export const mockPayouts: PayoutRequest[] = [
  {
    id: 'req-1',
    payoutNumber: 'PYT-2026-4029',
    requestedDate: '2026-09-30T08:14:00Z',
    payeeName: 'Aisha Bello',
    payeeType: 'Referrer',
    source: 'Commission',
    amount: 15000000,
    fee: 5000,
    netAmount: 14995000,
    destinationBank: 'GTBank',
    destinationAccount: '0123456789',
    status: 'Pending'
  },
  {
    id: 'req-2',
    payoutNumber: 'PYT-2026-4028',
    requestedDate: '2026-09-29T16:30:00Z',
    payeeName: 'ABA Surulere Branch',
    payeeType: 'Merchant',
    source: 'Merchant Settlement',
    amount: 48500000,
    fee: 0,
    netAmount: 48500000,
    destinationBank: 'Zenith Bank',
    destinationAccount: '0987654321',
    status: 'Processing',
    batchId: 'bat-1'
  },
  {
    id: 'req-3',
    payoutNumber: 'PYT-2026-4027',
    requestedDate: '2026-09-28T11:20:00Z',
    payeeName: 'John Doe',
    payeeType: 'Customer',
    source: 'Wallet',
    amount: 500000,
    fee: 5000,
    netAmount: 495000,
    destinationBank: 'FirstBank',
    destinationAccount: '1122334455',
    status: 'Paid',
    approvedBy: 'Admin'
  }
];

export const mockPayoutBatches: PayoutBatch[] = [
  {
    id: 'bat-1',
    batchNumber: 'BAT-2026-001',
    createdDate: '2026-09-29T17:00:00Z',
    totalAmount: 125000000,
    requestCount: 42,
    status: 'Processing'
  },
  {
    id: 'bat-2',
    batchNumber: 'BAT-2026-002',
    createdDate: '2026-09-25T17:00:00Z',
    totalAmount: 340000000,
    requestCount: 105,
    status: 'Completed'
  }
];

export const mockPayoutSettings: PayoutSettings = {
  minAmount: 500000, // ₦5,000
  dailyLimit: 100000000, // ₦1,000,000
  schedule: 'On request',
  feeRule: 'Flat ₦50',
  autoApproveBelow: 1000000, // ₦10,000
  requiredKycLevel: 2,
  holdingPeriodDays: 3,
  enforceNameMatching: true
};
