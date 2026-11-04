'use client';

import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function PayoutBatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="space-y-6 pb-20 mx-auto max-w-5xl">
      <PageHeader 
        title={`Batch ${id}`}
        description="Review and process multiple payouts simultaneously."
        backHref="/erp/payouts/batches"
        action={
          <div className="flex gap-2">
            <Button variant="outline">Export Bank CSV</Button>
            <Button variant="primary">Process Entire Batch</Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-sm text-text-muted">Total Batch Value</p>
          <p className="text-3xl font-bold mt-2">₦ 125,000</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-sm text-text-muted">Total Requests</p>
          <p className="text-3xl font-bold mt-2">42</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-sm text-text-muted">Status</p>
          <p className="text-xl font-medium mt-2 text-warning-dark">Pending Processing</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden p-8 text-center text-text-muted">
        <p>List of specific payout requests in this batch would go here.</p>
      </div>
    </div>
  );
}
