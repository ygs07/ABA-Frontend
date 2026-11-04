'use client';

import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPayoutSettings, updatePayoutSettings } from '@/features/payouts/api';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PayoutSettingsPage() {
  const [schedule, setSchedule] = useState('on_request');
  const [requiredKycLevel, setRequiredKycLevel] = useState('3');
  const [enforceNameMatching, setEnforceNameMatching] = useState(true);
  const { data: settings, isLoading } = useQuery({
    queryKey: ['payout-settings'],
    queryFn: () => getPayoutSettings()
  });
  useEffect(() => {
    if (!settings?.data) return;
    setSchedule(settings.data.schedule === 'Weekly Friday' ? 'weekly_friday' : settings.data.schedule === 'Monthly' ? 'monthly' : 'on_request');
    setRequiredKycLevel(String(settings.data.requiredKycLevel));
    setEnforceNameMatching(settings.data.enforceNameMatching);
  }, [settings]);
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: updatePayoutSettings,
    onSuccess: async () => { toast.success('Payout settings saved'); await queryClient.invalidateQueries({ queryKey: ['payout-settings'] }); },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to save payout settings'),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateMutation.mutate({
      minimumAmount: Number(formData.get('minimumAmount')),
      dailyLimit: Number(formData.get('dailyLimit')),
      autoApproveBelow: Number(formData.get('autoApproveBelow')),
      schedule,
      requiredKycLevel: Number(requiredKycLevel),
      holdingPeriodDays: Number(formData.get('holdingPeriodDays')),
      enforceNameMatching,
    });
  };

  if (isLoading) return <div>Loading settings...</div>;
  if (!settings?.data) return <div>Failed to load settings</div>;

  return (
    <div className="space-y-6 pb-20 mx-auto max-w-4xl">
      <PageHeader 
        title="Payout Settings" 
        description="Configure rules for automated withdrawals and processing."
        backHref="/erp/payouts"
        action={<Button type="submit" form="payout-settings" disabled={updateMutation.isPending}>Save Changes</Button>}
      />

      <form id="payout-settings" onSubmit={submit} className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Minimums and Limits */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Limits & Rules</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Payout Amount (₦)</label>
                <Input name="minimumAmount" type="number" defaultValue={settings.data.minAmount / 100} />
                <p className="text-xs text-text-muted">Lowest allowed withdrawal.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Limit per Payee (₦)</label>
                <Input name="dailyLimit" type="number" defaultValue={settings.data.dailyLimit / 100} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-Approve Below (₦)</label>
                <Input name="autoApproveBelow" type="number" defaultValue={settings.data.autoApproveBelow / 100} />
                <p className="text-xs text-text-muted">Requests below this bypass manual approval.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule</label>
                <Select defaultValue={settings.data.schedule} onValueChange={(value) => setSchedule(value === 'Weekly Friday' ? 'weekly_friday' : value.toLowerCase().replace(' ', '_'))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On request">On request</SelectItem>
                    <SelectItem value="Weekly Friday">Weekly Friday</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Compliance */}
          <section className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-bold text-lg border-b border-border pb-2">Compliance & Security</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Required KYC Level</label>
                <Select defaultValue={settings.data.requiredKycLevel.toString()} onValueChange={setRequiredKycLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 (Basic)</SelectItem>
                    <SelectItem value="2">Level 2 (Identity Verified)</SelectItem>
                    <SelectItem value="3">Level 3 (Address Verified)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Holding Period (Days)</label>
                <Input name="holdingPeriodDays" type="number" defaultValue={settings.data.holdingPeriodDays} />
                <p className="text-xs text-text-muted">Wait time before funds become available.</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg border border-border mt-4">
              <div>
                <p className="font-medium text-sm">Enforce Account Name Matching</p>
                <p className="text-xs text-text-muted">Reject bank accounts that don't match the payee's verified legal name.</p>
              </div>
              <Switch checked={enforceNameMatching} onCheckedChange={setEnforceNameMatching} />
            </div>
          </section>

        </div>
      </form>
    </div>
  );
}
