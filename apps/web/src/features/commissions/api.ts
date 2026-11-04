import { CommissionPlan, CommissionRecord, CommissionKPIs } from './types';
import { mockCommissionPlans, mockCommissionRecords, mockCommissionKPIs } from './mocks';
import { API_MODE, fetchApi } from '@/lib/api';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getCommissionKPIs(): Promise<CommissionKPIs> {
  if (API_MODE !== 'mock') {
    const overview = await fetchApi<{
      generatedPeriod: number;
      pendingApproval: number;
      approvedUnpaid: number;
      paidPeriod: number;
      reversedPeriod: number;
      outstandingLiability: number;
    }>('/api/v1/commissions/overview');
    return {
      generatedPeriod: Math.round(overview.generatedPeriod * 100),
      pendingApproval: Math.round(overview.pendingApproval * 100),
      approvedUnpaid: Math.round(overview.approvedUnpaid * 100),
      paidPeriod: Math.round(overview.paidPeriod * 100),
      reversedPeriod: Math.round(overview.reversedPeriod * 100),
      outstandingLiability: Math.round(overview.outstandingLiability * 100),
    };
  }
  await delay(300);
  return mockCommissionKPIs;
}

export async function getCommissionRecords(): Promise<{ data: CommissionRecord[] }> {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: BackendCommission[] }>('/api/v1/commissions?limit=100');
    return { data: response.data.map(toCommissionRecord) };
  }
  await delay(300);
  return { data: [...mockCommissionRecords] };
}

export async function approveCommission(commissionId: string): Promise<void> {
  await fetchApi(`/api/v1/commissions/${encodeURIComponent(commissionId)}/approve`, {
    method: 'POST',
  });
}

export async function releaseCommission(commissionId: string): Promise<void> {
  await fetchApi(`/api/v1/commissions/${encodeURIComponent(commissionId)}/release`, {
    method: 'POST',
  });
}

export async function reverseCommission(commissionId: string): Promise<void> {
  await fetchApi(`/api/v1/commissions/${encodeURIComponent(commissionId)}/reverse`, {
    method: 'POST',
  });
}

export async function releaseEligibleCommissions(): Promise<void> {
  await fetchApi('/api/v1/commissions/release-eligible', { method: 'POST' });
}

type BackendCommission = {
  id: number;
  source_type: string;
  source_id: number;
  commission_level: number;
  calculation_base: string | number | null;
  applied_rate: string | number | null;
  amount: string | number | null;
  status: 1 | 2 | 3 | 4;
  createdAt: string;
  user?: { first_name?: string; last_name?: string } | null;
  commission_rule_id: number | null;
  sourceOrderNumber?: string | null;
  sourceCustomerName?: string | null;
};

function toCommissionRecord(commission: BackendCommission): CommissionRecord {
  const statusByCode: Record<number, CommissionRecord['status']> = {
    1: 'Pending',
    2: 'Held',
    3: 'Released',
    4: 'Reversed',
  };
  return {
    id: String(commission.id),
    commissionNumber: `COM-${commission.id}`,
    date: commission.createdAt,
    beneficiaryId: '',
    beneficiaryName: [commission.user?.first_name, commission.user?.last_name].filter(Boolean).join(' ') || 'Beneficiary',
    sourceOrderId: String(commission.source_id),
    sourceOrderNumber: commission.sourceOrderNumber ?? `${commission.source_type}-${commission.source_id}`,
    sourceCustomerName: commission.sourceCustomerName ?? '',
    level: commission.commission_level,
    baseAmount: Math.round(Number(commission.calculation_base ?? 0) * 100),
    rate: Number(commission.applied_rate ?? 0),
    amount: Math.round(Number(commission.amount ?? 0) * 100),
    planId: String(commission.commission_rule_id ?? ''),
    planName: 'Commission rule',
    status: statusByCode[commission.status] ?? 'Pending',
  };
}

export async function getCommissionPlans(): Promise<{ data: CommissionPlan[] }> {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<{ data: BackendCommissionRule[] }>('/api/v1/commission-rules?limit=100');
    return { data: response.data.map(toCommissionPlan) };
  }
  await delay(300);
  return { data: [...mockCommissionPlans] };
}

type BackendCommissionRule = {
  id: number;
  title: string;
  qualification_trigger: 'order_paid' | 'order_delivered' | 'first_order_only';
  network_levels: number;
  level_rates: Array<{ level: number; percentageAmount: number }>;
  percentage_amount?: string | number | null;
  is_active: boolean;
};

function toCommissionPlan(rule: BackendCommissionRule): CommissionPlan {
  const rates = rule.level_rates?.length
    ? Object.fromEntries(rule.level_rates.map((rate) => [rate.level, rate.percentageAmount]))
    : rule.percentage_amount === null || rule.percentage_amount === undefined
      ? {}
      : { 1: Number(rule.percentage_amount) };
  return {
    id: String(rule.id),
    name: rule.title,
    version: 1,
    trigger: rule.qualification_trigger === 'order_delivered' ? 'Order Delivered' : 'Order Paid',
    levels: rule.network_levels,
    rates,
    active: rule.is_active,
  };
}
