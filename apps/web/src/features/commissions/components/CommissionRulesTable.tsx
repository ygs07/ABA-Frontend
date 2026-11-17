'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Loader2, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store';
import { getCommissionRules, setCommissionPlanStatus } from '../api';

const triggerLabels: Record<string, string> = {
  order_paid: 'Order paid',
  order_delivered: 'Order delivered',
  first_order_only: 'First paid order only',
};

export function CommissionRulesTable() {
  const userType = useAuthStore((state) => state.user?.userType ?? state.activeRole);
  const canManageRules = userType === 'Admin' || userType === 'Super Admin';
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['commission-rules'], queryFn: getCommissionRules });
  const rule = data?.data[0];
  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => setCommissionPlanStatus(String(id), isActive),
    onSuccess: (_result, variables) => {
      toast.success(`Commission plan ${variables.isActive ? 'activated' : 'deactivated'}`);
      void queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
    },
    onError: (cause) => toast.error(cause instanceof Error ? cause.message : 'Unable to update commission plan status'),
  });

  if (isLoading) return <div className="flex min-h-48 items-center justify-center text-sm text-text-muted"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading commission plan…</div>;
  if (error) return <div className="rounded-xl border border-error-border bg-error-bg p-4 text-sm text-error">Unable to load the commission plan. Please refresh and try again.</div>;
  if (!rule) return <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center"><h2 className="font-semibold text-text">No commission plan configured</h2><p className="mt-1 text-sm text-text-muted">Create the single platform-wide rule before qualifying purchases can create commission entries.</p>{canManageRules && <Button asChild className="mt-4"><Link href="/erp/commissions/rules/new">Create commission plan</Link></Button>}</div>;

  const rates = [...(rule.level_rates ?? [])].sort((left, right) => left.level - right.level);
  const systemTotal = rates.reduce((total, rate) => total + Number(rate.systemPercentageAmount ?? 0), 0);
  const networkTotal = rates.reduce((total, rate) => total + Number(rate.merchantPercentageAmount ?? rate.percentageAmount ?? 0), 0);

  return (
    <div className="max-w-4xl space-y-6">
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-6 sm:flex-row sm:items-start">
          <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-text">{rule.title}</h2><Badge variant={rule.is_active ? 'default' : 'secondary'}>{rule.is_active ? 'Active' : 'Inactive'}</Badge></div>{rule.description && <p className="mt-1 max-w-2xl text-sm text-text-muted">{rule.description}</p>}</div>
          {canManageRules && <div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: rule.id, isActive: !rule.is_active })}>{rule.is_active ? 'Deactivate' : 'Activate'}</Button><Button size="sm" asChild><Link href={`/erp/commissions/rules/${rule.id}`}><Edit3 className="mr-1.5 h-3.5 w-3.5" />Update configuration</Link></Button></div>}
        </div>
        <dl className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3"><Metric label="Configured levels" value={rule.network_levels} /><Metric label="Platform allocation" value={`${systemTotal}%`} /><Metric label="Network allocation" value={`${networkTotal}%`} /></dl>
      </section>
      <section className="rounded-xl border border-border bg-surface p-6"><div className="mb-4 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-brand-600" /><h3 className="font-bold text-text">Rule configuration</h3></div><dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3"><Detail label="Qualification trigger" value={triggerLabels[rule.qualification_trigger] ?? rule.qualification_trigger} /><Detail label="Minimum order value" value={`₦${Number(rule.minimum_order_value ?? 0).toLocaleString('en-NG')}`} /><Detail label="Holding period" value={`${rule.holding_period_days ?? 0} day(s)`} /><Detail label="Effective period" value={`${rule.effective_from ?? 'Immediately'} — ${rule.effective_to ?? 'No end date'}`} /><Detail label="Commission type" value={rule.commission_type === 2 ? 'Fixed amount' : 'Percentage'} /></dl></section>
      <section className="rounded-xl border border-border bg-surface p-6"><h3 className="mb-4 font-bold text-text">Level allocations</h3><div className="space-y-3">{rates.map((rate) => <div key={rate.level} className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 text-sm sm:grid-cols-3"><span className="font-semibold text-text">Level {rate.level}</span><span>Platform: <strong>{Number(rate.systemPercentageAmount ?? 0)}%</strong></span><span>Referral network: <strong>{Number(rate.merchantPercentageAmount ?? rate.percentageAmount ?? 0)}%</strong></span></div>)}</div></section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-lg border border-border bg-surface-1 p-3.5"><dt className="text-xs text-text-muted">{label}</dt><dd className="mt-0.5 text-lg font-bold text-text">{value}</dd></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-text-muted">{label}</dt><dd className="mt-0.5 font-medium text-text">{value}</dd></div>; }
