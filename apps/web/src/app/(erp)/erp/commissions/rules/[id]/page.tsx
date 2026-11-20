'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/features/auth/store';
import { getCommissionPlan, updateCommissionPlan } from '@/features/commissions/api';
import { toast } from 'sonner';

type LevelAllocation = {
  company: number;
  shareholders: number;
  users: number;
};

type FormValues = {
  title: string;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
  networkLevels: number;
  holdingPeriodDays: number;
  isActive: boolean;
  rates: LevelAllocation[];
};

const DEFAULT_LEVEL_ALLOCATION: LevelAllocation = {
  company: 50,
  shareholders: 30,
  users: 20,
};

export default function EditRulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userType = useAuthStore((state) => state.user?.userType ?? state.activeRole);
  const canManageRules = userType === 'Admin' || userType === 'Super Admin';
  const [form, setForm] = useState<FormValues | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);

  const { data: rule, isLoading } = useQuery({
    queryKey: ['commission-rule', id],
    queryFn: () => getCommissionPlan(id),
    enabled: canManageRules,
  });

  useEffect(() => {
    if (!rule) return;
    const rates = Array.from({ length: rule.network_levels }, (_, index) => {
      const rate = rule.level_rates?.[index];
      return {
        company: Number(rate?.companyPercentageAmount ?? rate?.systemPercentageAmount ?? 0),
        shareholders: Number(rate?.shareholdersPercentageAmount ?? 0),
        users: Number(
          rate?.usersPercentageAmount ??
            rate?.merchantPercentageAmount ??
            rate?.percentageAmount ??
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
      networkLevels: rule.network_levels,
      holdingPeriodDays: rule.holding_period_days ?? 0,
      isActive: rule.is_active,
      rates,
    });
  }, [rule]);

  const invalidLevelIndex = form
    ? form.rates.findIndex(
        (rate) => Math.round((rate.company + rate.shareholders + rate.users) * 100) / 100 !== 100,
      )
    : -1;
  const hasInvalidDateRange = Boolean(
    form?.effectiveFrom && form?.effectiveTo && form.effectiveFrom > form.effectiveTo,
  );
  const hasValidationError =
    !form || !form.title.trim() || invalidLevelIndex !== -1 || hasInvalidDateRange;

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!canManageRules) throw new Error('Only Admin or Super Admin can modify commission rules');
      if (!form) throw new Error('Commission rule has not loaded');
      if (!form.title.trim()) throw new Error('Plan name is required');
      if (hasInvalidDateRange) throw new Error('Effective To date cannot be earlier than Effective From');
      if (invalidLevelIndex !== -1) {
        throw new Error(`Level ${invalidLevelIndex + 1} percentages must add up to 100%`);
      }
      return updateCommissionPlan(id, {
        title: form.title.trim(),
        description: form.description || undefined,
        effectiveFrom: form.effectiveFrom || undefined,
        effectiveTo: form.effectiveTo || undefined,
        minimumOrderValue: 0,
        networkLevels: form.networkLevels,
        levelRates: form.rates.map((rate, index) => ({
          level: index + 1,
          companyPercentageAmount: rate.company,
          shareholdersPercentageAmount: rate.shareholders,
          usersPercentageAmount: rate.users,
          systemPercentageAmount: rate.company,
          merchantPercentageAmount: rate.users,
          percentageAmount: rate.users,
        })),
        percentageAmount: form.rates[0]?.users ?? 0,
        holdingPeriodDays: form.holdingPeriodDays,
        isActive: form.isActive,
      });
    },
    onSuccess: () => {
      setConfirmSave(false);
      toast.success('Commission rule updated');
      void queryClient.invalidateQueries({ queryKey: ['commission-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      router.push('/erp/commissions/rules');
    },
    onError: (error) => {
      setConfirmSave(false);
      toast.error(error instanceof Error ? error.message : 'Unable to update commission rule');
    },
  });

  if (!canManageRules) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-20">
        <PageHeader
          title="Restricted Access"
          description="Strict permissions apply to commission rule configuration."
          backHref="/erp/commissions/rules"
        />
        <div className="rounded-xl border border-error-border bg-error-bg p-6 text-sm text-error space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4" />
            Admin or Super Admin access required
          </div>
          <p>
            You do not have permission to edit platform-wide commission rules. Contact a Super Admin if changes are required.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/erp/commissions/rules">Back to Commission Plan</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !form) {
    return <div className="p-6 text-sm text-text-muted">Loading commission rule…</div>;
  }

  const setField = <Key extends keyof FormValues>(key: Key, value: FormValues[Key]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateLevelCount = (value: number) => {
    const networkLevels = Math.max(1, value || 1);
    setForm((current) =>
      current
        ? {
            ...current,
            networkLevels,
            rates: Array.from(
              { length: networkLevels },
              (_, index) => current.rates[index] ?? { ...DEFAULT_LEVEL_ALLOCATION },
            ),
          }
        : current,
    );
  };

  const handleAddLevel = () => {
    setForm((current) => {
      if (!current) return current;
      const nextRates = [...current.rates, { ...DEFAULT_LEVEL_ALLOCATION }];
      return {
        ...current,
        networkLevels: nextRates.length,
        rates: nextRates,
      };
    });
  };

  const handleRemoveLevel = (indexToRemove: number) => {
    setForm((current) => {
      if (!current || current.rates.length <= 1) return current;
      const nextRates = current.rates.filter((_, idx) => idx !== indexToRemove);
      return {
        ...current,
        networkLevels: nextRates.length,
        rates: nextRates,
      };
    });
  };

  const updateLevelRate = (index: number, field: keyof LevelAllocation, value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    const rates = [...form.rates];
    rates[index] = { ...rates[index], [field]: safeValue };
    setField('rates', rates);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <PageHeader
        title="Edit Commission Plan"
        description="Configure how product sales margin (Selling Price − Production Cost) is split across Company, Shareholders, and Users at each level."
        backHref="/erp/commissions/rules"
        action={
          <Button
            loading={saveMutation.isPending}
            disabled={hasValidationError}
            onClick={() => setConfirmSave(true)}
          >
            Save changes
          </Button>
        }
      />

      {confirmSave && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-amber-950">
            <p className="font-semibold">Confirm platform commission rule update</p>
            <p className="text-xs text-amber-900 mt-0.5">
              Changes apply to future qualifying product sales margins across {form.networkLevels} referral level(s).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmSave(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              loading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Confirm &amp; Save
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Plan name
            <Input value={form.title} onChange={(event) => setField('title', event.target.value)} />
          </label>
          <label className="flex items-center gap-3 pt-7 text-sm font-medium">
            <Checkbox
              checked={form.isActive}
              onCheckedChange={(checked) => setField('isActive', checked === true)}
            />
            Active
          </label>
        </div>

        <label className="block space-y-2 text-sm font-medium">
          Description
          <Input
            value={form.description}
            onChange={(event) => setField('description', event.target.value)}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Effective from
            <Input
              type="date"
              value={form.effectiveFrom}
              onChange={(event) => setField('effectiveFrom', event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Effective to
            <Input
              type="date"
              value={form.effectiveTo}
              onChange={(event) => setField('effectiveTo', event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Holding period (days)
            <Input
              type="number"
              min="0"
              value={form.holdingPeriodDays}
              onChange={(event) => setField('holdingPeriodDays', Number(event.target.value))}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Network levels
            <Input
              type="number"
              min="1"
              value={form.networkLevels}
              onChange={(event) => updateLevelCount(Number(event.target.value))}
            />
          </label>
        </div>

        {hasInvalidDateRange && (
          <p className="text-xs font-medium text-error">
            Effective To date cannot be earlier than Effective From date.
          </p>
        )}

        <div className="space-y-4 rounded-lg border border-border bg-surface-2 p-4">
          <div>
            <h2 className="font-semibold text-text">Three-way margin allocations</h2>
            <p className="text-xs text-text-muted">
              Each level splits 100% of the product sales margin (Selling Price − Production Cost) across Company, Shareholders, and Users on that Line.
            </p>
          </div>

          {form.rates.map((rate, index) => {
            const total = Number((rate.company + rate.shareholders + rate.users).toFixed(2));
            const isValid = total === 100;
            return (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-text">Level {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={isValid ? 'default' : 'secondary'}>
                      {isValid ? 'Total: 100%' : `Total: ${total}% (must equal 100%)`}
                    </Badge>
                    {form.rates.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLevel(index)}
                        className="h-7 px-2 text-xs text-error hover:bg-error-bg/30 hover:text-error"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="text-xs text-text-muted">
                    Company (%)
                    <Input
                      className="mt-1"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={rate.company}
                      onChange={(event) =>
                        updateLevelRate(index, 'company', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="text-xs text-text-muted">
                    Shareholders (%)
                    <Input
                      className="mt-1"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={rate.shareholders}
                      onChange={(event) =>
                        updateLevelRate(index, 'shareholders', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="text-xs text-text-muted">
                    Users on Line (%)
                    <Input
                      className="mt-1"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={rate.users}
                      onChange={(event) =>
                        updateLevelRate(index, 'users', Number(event.target.value))
                      }
                    />
                  </label>
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddLevel}
            className="w-full border-dashed border-2 py-4 text-sm font-semibold hover:border-brand-500 hover:bg-brand-50/50"
          >
            <Plus className="mr-1.5 h-4 w-4 text-brand-600" />
            Add Level (Level {form.rates.length + 1})
          </Button>
        </div>
      </div>
    </div>
  );
}
