'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { AmountText } from '@/components/patterns/AmountText';
import { getCommissionRules, type BackendCommissionRule } from '@/features/commissions/api';
import { toast } from 'sonner';

interface SimulatedLevel {
  level: number;
  companyRate: number;
  shareholdersRate: number;
  usersRate: number;
  companyAmount: number;
  shareholdersAmount: number;
  usersAmount: number;
  totalAmount: number;
}

interface MarginSimulationResult {
  isActive: boolean;
  sellingPrice: number;
  productionCost: number;
  margin: number;
  totalCompany: number;
  totalShareholders: number;
  totalUsers: number;
  levels: SimulatedLevel[];
}

export default function CommissionSimulatorPage() {
  const { data: rulesResponse, isLoading } = useQuery({
    queryKey: ['commission-rules'],
    queryFn: getCommissionRules,
  });
  const rules = useMemo(() => rulesResponse?.data ?? [], [rulesResponse]);

  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [sellingPrice, setSellingPrice] = useState('15000');
  const [productionCost, setProductionCost] = useState('10000');
  const [availableLevels, setAvailableLevels] = useState('');
  const [result, setResult] = useState<MarginSimulationResult | null>(null);

  const activeRule: BackendCommissionRule | undefined =
    rules.find((r) => String(r.id) === selectedRuleId) ?? rules[0];

  const liveSelling = Number(sellingPrice) || 0;
  const liveCost = Number(productionCost) || 0;
  const liveMargin = Math.max(0, liveSelling - liveCost);

  const runSimulation = () => {
    const numericSelling = Number(sellingPrice);
    const numericCost = Number(productionCost);
    if (!activeRule) {
      toast.error('No commission rule available to simulate.');
      return;
    }
    if (!Number.isFinite(numericSelling) || numericSelling < 0 || !Number.isFinite(numericCost) || numericCost < 0) {
      toast.error('Enter valid selling price and production cost values.');
      return;
    }

    const margin = Math.max(0, numericSelling - numericCost);
    const sortedRates = [...(activeRule.level_rates ?? [])].sort((a, b) => a.level - b.level);
    const maxLevels = availableLevels
      ? Math.max(1, Math.min(sortedRates.length, Number(availableLevels) || sortedRates.length))
      : sortedRates.length;

    const levels: SimulatedLevel[] = sortedRates.slice(0, maxLevels).map((rate) => {
      const companyRate = Number(rate.companyPercentageAmount ?? rate.systemPercentageAmount ?? 0);
      const shareholdersRate = Number(rate.shareholdersPercentageAmount ?? 0);
      const usersRate = Number(
        rate.usersPercentageAmount ?? rate.merchantPercentageAmount ?? rate.percentageAmount ?? 0,
      );
      const companyAmount = (margin * companyRate) / 100;
      const shareholdersAmount = (margin * shareholdersRate) / 100;
      const usersAmount = (margin * usersRate) / 100;
      return {
        level: rate.level,
        companyRate,
        shareholdersRate,
        usersRate,
        companyAmount,
        shareholdersAmount,
        usersAmount,
        totalAmount: companyAmount + shareholdersAmount + usersAmount,
      };
    });

    setResult({
      isActive: activeRule.is_active,
      sellingPrice: numericSelling,
      productionCost: numericCost,
      margin,
      totalCompany: levels.reduce((sum, lvl) => sum + lvl.companyAmount, 0),
      totalShareholders: levels.reduce((sum, lvl) => sum + lvl.shareholdersAmount, 0),
      totalUsers: levels.reduce((sum, lvl) => sum + lvl.usersAmount, 0),
      levels,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <PageHeader
        title="Rule Simulator"
        description="Preview margin-based three-way commission payouts (Company, Shareholders, Users) without creating records."
        backHref="/erp/commissions"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-5 text-lg font-bold">Simulation inputs</h2>
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Commission rule
              <select
                value={activeRule ? String(activeRule.id) : selectedRuleId}
                onChange={(event) => setSelectedRuleId(event.target.value)}
                disabled={isLoading || rules.length === 0}
                className="mt-1 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm"
              >
                {rules.length === 0 && <option value="">No commission rule found</option>}
                {rules.map((plan) => (
                  <option key={plan.id} value={String(plan.id)}>
                    {plan.title}
                    {plan.is_active ? '' : ' (inactive)'}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Selling price (₦)
              <input
                value={sellingPrice}
                onChange={(event) => setSellingPrice(event.target.value)}
                inputMode="decimal"
                placeholder="e.g. 15000"
                className="mt-1 h-11 w-full rounded-lg border border-border px-3 text-sm"
              />
            </label>

            <label className="block text-sm font-medium">
              Production cost (₦)
              <input
                value={productionCost}
                onChange={(event) => setProductionCost(event.target.value)}
                inputMode="decimal"
                placeholder="e.g. 10000"
                className="mt-1 h-11 w-full rounded-lg border border-border px-3 text-sm"
              />
            </label>

            <div className="rounded-lg border border-border bg-surface-1 px-3 py-2.5 text-sm flex items-center justify-between">
              <span className="text-text-muted">Commissionable margin</span>
              <strong className="text-text">
                <AmountText amountInKobo={Math.round(liveMargin * 100)} />
              </strong>
            </div>

            <label className="block text-sm font-medium">
              Available upline levels <span className="font-normal text-text-muted">(optional)</span>
              <input
                value={availableLevels}
                onChange={(event) => setAvailableLevels(event.target.value)}
                inputMode="numeric"
                placeholder="Use rule maximum"
                className="mt-1 h-11 w-full rounded-lg border border-border px-3 text-sm"
              />
            </label>

            <Button className="w-full" onClick={runSimulation} disabled={isLoading || !activeRule}>
              Run simulation
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface-2 p-6">
          <h2 className="mb-5 text-lg font-bold">Projected margin split</h2>
          {!result ? (
            <p className="py-16 text-center text-sm text-text-muted">
              Enter selling price and production cost, then run a simulation to preview the three-way margin split.
            </p>
          ) : (
            <div className="space-y-4">
              <div
                className={`rounded-lg border p-3 text-sm ${
                  result.margin > 0 && result.isActive
                    ? 'border-success-200 bg-success-50 text-success-dark'
                    : 'border-amber-300 bg-amber-50 text-amber-900'
                }`}
              >
                {!result.isActive
                  ? 'Warning: The selected rule is currently inactive.'
                  : result.margin <= 0
                    ? 'Margin is ₦0 because selling price does not exceed production cost; no commission is generated.'
                    : `₦${result.margin.toLocaleString('en-NG')} margin qualifies for three-way commission distribution.`}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border bg-white p-3">
                  <span className="block text-xs text-text-muted">Sales margin</span>
                  <strong>
                    <AmountText amountInKobo={Math.round(result.margin * 100)} />
                  </strong>
                </div>
                <div className="rounded-lg border border-border bg-white p-3">
                  <span className="block text-xs text-text-muted">Company share</span>
                  <strong>
                    <AmountText amountInKobo={Math.round(result.totalCompany * 100)} />
                  </strong>
                </div>
                <div className="rounded-lg border border-border bg-white p-3">
                  <span className="block text-xs text-text-muted">Shareholders share</span>
                  <strong>
                    <AmountText amountInKobo={Math.round(result.totalShareholders * 100)} />
                  </strong>
                </div>
                <div className="rounded-lg border border-border bg-white p-3">
                  <span className="block text-xs text-text-muted">Users on line share</span>
                  <strong>
                    <AmountText amountInKobo={Math.round(result.totalUsers * 100)} />
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                {result.levels.map((level) => (
                  <div key={level.level} className="rounded-lg border border-border bg-white p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">Level {level.level}</span>
                      <strong>
                        <AmountText amountInKobo={Math.round(level.totalAmount * 100)} />
                      </strong>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      Company: {level.companyRate}% (<AmountText amountInKobo={Math.round(level.companyAmount * 100)} />) ·{' '}
                      Shareholders: {level.shareholdersRate}% (<AmountText amountInKobo={Math.round(level.shareholdersAmount * 100)} />) ·{' '}
                      Users: {level.usersRate}% (<AmountText amountInKobo={Math.round(level.usersAmount * 100)} />)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
