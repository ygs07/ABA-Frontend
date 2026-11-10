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

export async function getCommissionRecords(orderId?: string): Promise<{ data: CommissionRecord[] }> {
  if (API_MODE !== 'mock') {
    const query = new URLSearchParams({ limit: '100' });
    if (orderId) query.set('search', orderId);
    const response = await fetchApi<{ data: BackendCommission[] }>(`/api/v1/commissions?${query.toString()}`);
    return { data: response.data.map(toCommissionRecord) };
  }
  await delay(300);
  return {
    data: orderId
      ? mockCommissionRecords.filter((record) => record.sourceOrderId === orderId)
      : [...mockCommissionRecords],
  };
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
  commissionRule?: { id: number; title: string; merchantId: number | null } | null;
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
    planName: commission.commissionRule?.title ?? 'Commission rule',
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

export type CommissionRuleInput = {
  title: string;
  description?: string;
  isActive?: boolean;
  commissionType: 1 | 2;
  percentageAmount?: number;
  fixedAmount?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  qualificationTrigger?: 'order_paid' | 'order_delivered' | 'first_order_only';
  minimumOrderValue?: number;
  networkLevels?: number;
  levelRates?: Array<{ level: number; percentageAmount: number }>;
  baseAmountNet?: boolean;
  approvalMode?: 'automatic' | 'manual';
  holdingPeriodDays?: number;
};

export async function getCommissionPlan(id: string): Promise<BackendCommissionRule> {
  return fetchApi<BackendCommissionRule>(`/api/v1/commission-rules/${encodeURIComponent(id)}`);
}

export async function updateCommissionPlan(id: string, input: Partial<CommissionRuleInput>): Promise<BackendCommissionRule> {
  return fetchApi<BackendCommissionRule>(`/api/v1/commission-rules/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function setCommissionPlanStatus(id: string, isActive: boolean): Promise<void> {
  await fetchApi(`/api/v1/commission-rules/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });
}

export type CommissionSimulation = {
  ruleId: number;
  orderValue: number;
  deductions: number;
  calculationBase: number;
  commissionType: number;
  eligible: boolean;
  minimumOrderValue: number;
  levels: Array<{ level: number; rate: number | null; amount: number }>;
  totalCommission: number;
};

export async function simulateCommissionPlan(
  id: string,
  input: { orderValue: number; deductions?: number; availableLevels?: number },
): Promise<CommissionSimulation> {
  return fetchApi<CommissionSimulation>(`/api/v1/commission-rules/${encodeURIComponent(id)}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export type BackendCommissionRule = {
  id: number;
  title: string;
  description?: string | null;
  commission_type?: 1 | 2;
  fixed_amount?: string | number | null;
  qualification_trigger: 'order_paid' | 'order_delivered' | 'first_order_only';
  network_levels: number;
  level_rates: Array<{ level: number; percentageAmount: number }>;
  percentage_amount?: string | number | null;
  is_active: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
  minimum_order_value?: string | number;
  holding_period_days?: number;
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
