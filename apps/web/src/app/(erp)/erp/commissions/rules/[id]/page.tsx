
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { getCommissionPlan, updateCommissionPlan } from '@/features/commissions/api';
import { toast } from 'sonner';

type FormValues = {
  title: string;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
  minimumOrderValue: number;
  networkLevels: number;
  holdingPeriodDays: number;
  isActive: boolean;
  rates: Array<{ system: number; merchant: number }>;
};

export default function EditRulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormValues | null>(null);
  const { data: rule, isLoading } = useQuery({
    queryKey: ['commission-rule', id],
    queryFn: () => getCommissionPlan(id),
  });

  useEffect(() => {
    if (!rule) return;
    const rates = Array.from({ length: rule.network_levels }, (_, index) => {
      const rate = rule.level_rates?.[index];
      return {
        system: Number(rate?.systemPercentageAmount ?? 0),
        merchant: Number(
          rate?.merchantPercentageAmount ?? rate?.percentageAmount ??
            (index === 0 ? rule.percentage_amount ?? 0 : 0),
        ),
      };
    });
    // The editable draft must be reset only when the asynchronously loaded rule changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      title: rule.title,
      description: rule.description ?? '',
      effectiveFrom: rule.effective_from ?? '',
      effectiveTo: rule.effective_to ?? '',
      minimumOrderValue: Number(rule.minimum_order_value ?? 0),
      networkLevels: rule.network_levels,
      holdingPeriodDays: rule.holding_period_days ?? 0,
      isActive: rule.is_active,
      rates,
    });
  }, [rule]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!form) throw new Error('Commission rule has not loaded');
      return updateCommissionPlan(id, {
        title: form.title,
        description: form.description || undefined,
        effectiveFrom: form.effectiveFrom || undefined,
        effectiveTo: form.effectiveTo || undefined,
        minimumOrderValue: form.minimumOrderValue,
        networkLevels: form.networkLevels,
        levelRates: form.rates.map((rate, index) => ({
          level: index + 1,
          systemPercentageAmount: rate.system,
          merchantPercentageAmount: rate.merchant,
          percentageAmount: rate.merchant,
        })),
        percentageAmount: form.rates[0]?.merchant ?? 0,
        holdingPeriodDays: form.holdingPeriodDays,
        isActive: form.isActive,
      });
    },
    onSuccess: () => {
      toast.success('Commission rule updated');
      void queryClient.invalidateQueries({ queryKey: ['commission-plans'] });
      router.push('/erp/commissions/rules');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to update commission rule'),
  });

  if (isLoading || !form) return <div className="p-6 text-sm text-text-muted">Loading commission rule…</div>;

  const setField = <Key extends keyof FormValues>(key: Key, value: FormValues[Key]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };
  const updateLevelCount = (value: number) => {
    const networkLevels = Math.max(1, Math.min(10, value || 1));
    setForm((current) => current ? {
      ...current,
      networkLevels,
      rates: Array.from(
        { length: networkLevels },
        (_, index) => current.rates[index] ?? { system: 0, merchant: 0 },
      ),
    } : current);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <PageHeader title="Edit Commission Plan" description="Update the rule and its referral-level payout rates." backHref="/erp/commissions/rules" action={<Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save changes</Button>} />
      <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">Plan name<Input value={form.title} onChange={(event) => setField('title', event.target.value)} /></label>
          <label className="flex items-center gap-3 pt-7 text-sm font-medium"><Checkbox checked={form.isActive} onCheckedChange={(checked) => setField('isActive', checked === true)} />Active</label>
        </div>
        <label className="block space-y-2 text-sm font-medium">Description<Input value={form.description} onChange={(event) => setField('description', event.target.value)} /></label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">Effective from<Input type="date" value={form.effectiveFrom} onChange={(event) => setField('effectiveFrom', event.target.value)} /></label>
          <label className="space-y-2 text-sm font-medium">Effective to<Input type="date" value={form.effectiveTo} onChange={(event) => setField('effectiveTo', event.target.value)} /></label>
          <label className="space-y-2 text-sm font-medium">Minimum order value<Input type="number" min="0" value={form.minimumOrderValue} onChange={(event) => setField('minimumOrderValue', Number(event.target.value))} /></label>
          <label className="space-y-2 text-sm font-medium">Holding period (days)<Input type="number" min="0" value={form.holdingPeriodDays} onChange={(event) => setField('holdingPeriodDays', Number(event.target.value))} /></label>
          <label className="space-y-2 text-sm font-medium">Network levels<Input type="number" min="1" max="10" value={form.networkLevels} onChange={(event) => updateLevelCount(Number(event.target.value))} /></label>
        </div>
        <div className="space-y-3 rounded-lg border border-border bg-surface-2 p-4">
          <div><h2 className="font-semibold">Level allocations</h2><p className="text-xs text-text-muted">The platform and referral-network allocations combined cannot exceed 100% per level.</p></div>
          {form.rates.map((rate, index) => <div key={index} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[auto_1fr_1fr]"><span className="self-center text-sm font-medium">Level {index + 1}</span><label className="text-xs text-text-muted">Platform (%)<Input className="mt-1" type="number" min="0" max="100" value={rate.system} onChange={(event) => { const rates = [...form.rates]; rates[index] = { ...rate, system: Number(event.target.value) }; setField('rates', rates); }} /></label><label className="text-xs text-text-muted">Network (%)<Input className="mt-1" type="number" min="0" max="100" value={rate.merchant} onChange={(event) => { const rates = [...form.rates]; rates[index] = { ...rate, merchant: Number(event.target.value) }; setField('rates', rates); }} /></label></div>)}
        </div>
      </div>
    </div>
  );
}
