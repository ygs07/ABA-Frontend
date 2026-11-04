'use client';

import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PayoutsTable } from '@/features/payouts/components/PayoutsTable';
import { createPayoutBatch } from '@/features/payouts/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PayoutsPage() {
  const queryClient = useQueryClient();
  const batchMutation = useMutation({
    mutationFn: () => createPayoutBatch(),
    onSuccess: async () => { toast.success('Payout batch created from approved requests'); await queryClient.invalidateQueries({ queryKey: ['payouts'] }); await queryClient.invalidateQueries({ queryKey: ['payout-batches'] }); },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to create payout batch'),
  });
  return (
    <div className="space-y-6 pb-20 mx-auto max-w-7xl">
      <PageHeader 
        title="Payouts & Withdrawals" 
        description="Manage commission withdrawals, wallet cashouts, and merchant settlements."
        action={
          <div className="flex gap-2">
            <Button variant="outline">Export Bank CSV</Button>
            <Button onClick={() => batchMutation.mutate()} disabled={batchMutation.isPending}>Create Approved Batch</Button>
          </div>
        }
      />

      {/* KPI Cards could go here */}

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface-2">
          <h3 className="font-medium">Payout Requests</h3>
          <div className="flex gap-2">
            <Input placeholder="Search payee or bank..." className="h-9 w-64 text-sm" />
            <select className="h-9 rounded-md border border-border bg-surface px-3 text-sm focus:ring-brand-500 focus:border-brand-500">
              <option>All Types</option>
              <option>Commission</option>
              <option>Wallet</option>
              <option>Settlement</option>
            </select>
            <select className="h-9 rounded-md border border-border bg-surface px-3 text-sm focus:ring-brand-500 focus:border-brand-500">
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Paid</option>
            </select>
          </div>
        </div>
        <PayoutsTable />
      </div>
    </div>
  );
}
