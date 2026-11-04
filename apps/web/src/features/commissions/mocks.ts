import { CommissionPlan, CommissionRecord, CommissionKPIs } from './types';

export const mockCommissionPlans: CommissionPlan[] = [
  { id: 'plan-1', name: 'Default v3', version: 3, trigger: 'Order Delivered', levels: 3, rates: { 1: 5.0, 2: 2.0, 3: 1.0 }, active: true },
  { id: 'plan-2', name: 'Campaign Boost', version: 1, trigger: 'Order Paid', levels: 2, rates: { 1: 10.0, 2: 3.0 }, active: false }
];

export const mockCommissionRecords: CommissionRecord[] = [
  {
    id: 'com-1',
    commissionNumber: 'COM-001',
    date: '2026-09-12T14:30:00Z',
    beneficiaryId: 'user-1',
    beneficiaryName: 'Jane Doe',
    sourceOrderId: 'ord-10482',
    sourceOrderNumber: 'ORD-10482',
    sourceCustomerName: 'John Smith',
    level: 1,
    baseAmount: 10000000,
    rate: 5.0,
    amount: 500000,
    planId: 'plan-1',
    planName: 'Default v3',
    status: 'Held'
  },
  {
    id: 'com-2',
    commissionNumber: 'COM-002',
    date: '2026-09-12T14:30:00Z',
    beneficiaryId: 'user-2',
    beneficiaryName: 'Michael Referrer',
    sourceOrderId: 'ord-10482',
    sourceOrderNumber: 'ORD-10482',
    sourceCustomerName: 'John Smith',
    level: 2,
    baseAmount: 10000000,
    rate: 2.0,
    amount: 200000,
    planId: 'plan-1',
    planName: 'Default v3',
    status: 'Pending'
  },
  {
    id: 'com-3',
    commissionNumber: 'COM-003',
    date: '2026-09-10T11:15:00Z',
    beneficiaryId: 'user-3',
    beneficiaryName: 'Sarah Promoter',
    sourceOrderId: 'ord-10450',
    sourceOrderNumber: 'ORD-10450',
    sourceCustomerName: 'Emily Buyer',
    level: 1,
    baseAmount: 50000000,
    rate: 5.0,
    amount: 2500000,
    planId: 'plan-1',
    planName: 'Default v3',
    status: 'Released',
    payoutRef: 'PYT-001'
  }
];

export const mockCommissionKPIs: CommissionKPIs = {
  generatedPeriod: 45000000,
  pendingApproval: 12000000,
  approvedUnpaid: 8200000, // Matches finance API commissionsPayable = 82,000,000 wait, adjusting for zeros: 8,200,000
  paidPeriod: 35000000,
  reversedPeriod: 1500000,
  outstandingLiability: 82000000 // 82m kobo
};
