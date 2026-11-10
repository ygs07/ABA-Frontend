'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { AmountText } from '@/components/patterns/AmountText';
import { getCommissionPlans, simulateCommissionPlan, type CommissionSimulation } from '@/features/commissions/api';
import { toast } from 'sonner';

export default function CommissionSimulatorPage() {
  const { data: plans = [], isLoading } = useQuery({ queryKey: ['commission-plans'], queryFn: async () => (await getCommissionPlans()).data });
  const [ruleId, setRuleId] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [deductions, setDeductions] = useState('0');
  const [availableLevels, setAvailableLevels] = useState('');
  const [result, setResult] = useState<CommissionSimulation | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const run = async () => {
    const numericOrderValue = Number(orderValue);
    if (!ruleId || !Number.isFinite(numericOrderValue) || numericOrderValue < 0) {
      toast.error('Select a rule and enter a valid order value.');
      return;
    }
    setIsRunning(true);
    try {
      setResult(await simulateCommissionPlan(ruleId, {
        orderValue: numericOrderValue,
        deductions: Number(deductions) || 0,
        ...(availableLevels ? { availableLevels: Number(availableLevels) } : {}),
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to run the simulation.');
    } finally {
      setIsRunning(false);
    }
  };

  return <div className="mx-auto max-w-4xl space-y-6 pb-20">
    <PageHeader title="Rule Simulator" description="Preview platform commission payouts without creating commission records." backHref="/erp/commissions" />
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-white p-6">
        <h2 className="mb-5 text-lg font-bold">Simulation inputs</h2>
        <div className="space-y-4">
          <label className="block text-sm font-medium">Commission rule<select value={ruleId} onChange={(event) => setRuleId(event.target.value)} disabled={isLoading} className="mt-1 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">Select the active rule</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}{plan.active ? '' : ' (inactive)'}</option>)}</select></label>
          <label className="block text-sm font-medium">Order value (₦)<input value={orderValue} onChange={(event) => setOrderValue(event.target.value)} inputMode="decimal" placeholder="e.g. 25000" className="mt-1 h-11 w-full rounded-lg border border-border px-3 text-sm" /></label>
          <label className="block text-sm font-medium">Deductions (₦)<input value={deductions} onChange={(event) => setDeductions(event.target.value)} inputMode="decimal" className="mt-1 h-11 w-full rounded-lg border border-border px-3 text-sm" /></label>
          <label className="block text-sm font-medium">Available upline levels <span className="font-normal text-text-muted">(optional)</span><input value={availableLevels} onChange={(event) => setAvailableLevels(event.target.value)} inputMode="numeric" placeholder="Use rule maximum" className="mt-1 h-11 w-full rounded-lg border border-border px-3 text-sm" /></label>
          <Button className="w-full" onClick={() => void run()} disabled={isRunning || isLoading}>{isRunning ? 'Running…' : 'Run simulation'}</Button>
        </div>
      </section>
      <section className="rounded-xl border border-border bg-surface-2 p-6">
        <h2 className="mb-5 text-lg font-bold">Projected payout</h2>
        {!result ? <p className="py-16 text-center text-sm text-text-muted">Select a rule and run a simulation to preview the payout split.</p> : <div className="space-y-4"><div className={`rounded-lg border p-3 text-sm ${result.eligible ? 'border-success-200 bg-success-50 text-success-dark' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>{result.eligible ? 'This order qualifies for commission.' : `This order does not meet the ₦${result.minimumOrderValue.toLocaleString()} minimum or the rule is inactive.`}</div><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg border border-border bg-white p-3"><span className="block text-text-muted">Calculation base</span><strong><AmountText amountInKobo={result.calculationBase * 100} /></strong></div><div className="rounded-lg border border-border bg-white p-3"><span className="block text-text-muted">Total commission</span><strong><AmountText amountInKobo={result.totalCommission * 100} /></strong></div></div><div className="space-y-2">{result.levels.map((level) => <div key={level.level} className="flex items-center justify-between rounded-lg border border-border bg-white p-3 text-sm"><span>Level {level.level}{level.rate !== null ? ` · ${level.rate}%` : ' · Fixed'}</span><strong><AmountText amountInKobo={level.amount * 100} /></strong></div>)}</div></div>}
      </section>
    </div>
  </div>;
}
