import { fetchApi } from '@/lib/api';
import { PayoutBatch, PayoutRequest, PayoutSettings } from './types';

type BackendPayout = { id: number; payout_number: string; user_id: number; source: 'commission' | 'wallet' | 'merchant_settlement' | 'other'; amount: string; fee_amount: string; net_amount: string; status: 'pending' | 'approved' | 'processing' | 'paid' | 'failed' | 'rejected' | 'cancelled' | 'on_hold'; batch_id: number | null; requestedAt: string; metadata: { bankName?: string; accountNumber?: string; accountName?: string } | null; rejection_reason: string | null; failure_reason: string | null; };
type BackendBatch = { id: number; batch_number: string; createdAt: string; total_amount: string; request_count: number; status: 'draft' | 'approved' | 'processing' | 'completed' | 'partially_failed'; };
type BackendSettings = { minimum_amount: string; daily_limit: string; fee_amount: string; auto_approve_below: string | null; schedule: string; required_kyc_level: number; holding_period_days: number; enforce_name_matching: boolean; };

const nairaToKobo = (value: string | number | null | undefined) => Math.round(Number(value ?? 0) * 100);
const titleCase = (value: string) => value.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

function toPayout(payout: BackendPayout): PayoutRequest {
  const source = payout.source === 'merchant_settlement' ? 'Merchant Settlement' : titleCase(payout.source) as PayoutRequest['source'];
  return { id: String(payout.id), payoutNumber: payout.payout_number, requestedDate: payout.requestedAt, payeeName: payout.metadata?.accountName || `User #${payout.user_id}`, payeeType: payout.source === 'merchant_settlement' ? 'Merchant' : 'Customer', source, amount: nairaToKobo(payout.amount), fee: nairaToKobo(payout.fee_amount), netAmount: nairaToKobo(payout.net_amount), destinationBank: payout.metadata?.bankName || '—', destinationAccount: payout.metadata?.accountNumber || '—', status: titleCase(payout.status) as PayoutRequest['status'], batchId: payout.batch_id ? String(payout.batch_id) : undefined, notes: payout.rejection_reason || payout.failure_reason || undefined };
}

function toSettings(settings: BackendSettings): PayoutSettings {
  return { minAmount: nairaToKobo(settings.minimum_amount), dailyLimit: nairaToKobo(settings.daily_limit), schedule: settings.schedule === 'weekly_friday' ? 'Weekly Friday' : settings.schedule === 'monthly' ? 'Monthly' : 'On request', feeRule: `Flat ₦${Number(settings.fee_amount).toLocaleString()}`, autoApproveBelow: nairaToKobo(settings.auto_approve_below), requiredKycLevel: settings.required_kyc_level, holdingPeriodDays: settings.holding_period_days, enforceNameMatching: settings.enforce_name_matching };
}

export async function getPayouts() {
  const response = await fetchApi<BackendPayout[] | { data: BackendPayout[] }>('/api/v1/payouts');
  const payouts = Array.isArray(response) ? response : response.data;
  return { data: payouts.map(toPayout) };
}
export async function getPayout(id: string) { const payout = await fetchApi<BackendPayout>(`/api/v1/payouts/${encodeURIComponent(id)}`); return { data: toPayout(payout) }; }
export async function approvePayout(id: string) { return fetchApi<BackendPayout>(`/api/v1/payouts/${encodeURIComponent(id)}/approve`, { method: 'POST' }); }
export async function rejectPayout(id: string, rejectionReason: string) { return fetchApi<BackendPayout>(`/api/v1/payouts/${encodeURIComponent(id)}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rejectionReason }) }); }
export async function processPayout(id: string) { return fetchApi<BackendPayout>(`/api/v1/payouts/${encodeURIComponent(id)}/process`, { method: 'POST' }); }
export async function createPayoutBatch(limit = 100) { return fetchApi<BackendBatch>('/api/v1/payouts/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit }) }); }
export async function getPayoutBatches() { const response = await fetchApi<BackendBatch[] | { data: BackendBatch[] }>('/api/v1/payouts/batches'); const batches = Array.isArray(response) ? response : response.data; return { data: batches.map((batch) => ({ id: String(batch.id), batchNumber: batch.batch_number, createdDate: batch.createdAt, totalAmount: nairaToKobo(batch.total_amount), requestCount: batch.request_count, status: titleCase(batch.status) as PayoutBatch['status'] })) }; }
export async function getPayoutSettings() { const settings = await fetchApi<BackendSettings>('/api/v1/payouts/settings'); return { data: toSettings(settings) }; }
export async function updatePayoutSettings(input: { minimumAmount?: number; dailyLimit?: number; feeAmount?: number; autoApproveBelow?: number; schedule?: string; requiredKycLevel?: number; holdingPeriodDays?: number; enforceNameMatching?: boolean }) { return fetchApi<BackendSettings>('/api/v1/payouts/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }); }
