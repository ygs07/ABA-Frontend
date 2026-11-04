export interface CommissionPlan {
  id: string;
  name: string;
  version: number;
  trigger: 'Order Paid' | 'Order Delivered';
  levels: number;
  rates: Record<number, number>; // e.g., { 1: 5.0, 2: 2.0, 3: 1.0 } -> percentages
  active: boolean;
}

export interface CommissionRecord {
  id: string;
  commissionNumber: string;
  date: string;
  beneficiaryId: string;
  beneficiaryName: string;
  sourceOrderId: string;
  sourceOrderNumber: string;
  sourceCustomerName: string;
  level: number;
  baseAmount: number; // Order value
  rate: number; // Percentage applied
  amount: number; // Commission value in Kobo
  planId: string;
  planName: string;
  status: 'Pending' | 'Held' | 'Released' | 'Reversed';
  payoutRef?: string;
}

export interface CommissionKPIs {
  generatedPeriod: number;
  pendingApproval: number;
  approvedUnpaid: number;
  paidPeriod: number;
  reversedPeriod: number;
  outstandingLiability: number;
}
