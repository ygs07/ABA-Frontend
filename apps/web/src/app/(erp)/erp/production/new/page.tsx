'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Temporarily disabled until the production workflow is connected.
export default function NewProductionOrderPage() {
  return <div className="max-w-3xl space-y-6 pb-20"><PageHeader title="Production Orders" description="Creating production orders is temporarily unavailable." backHref="/erp/production" /></div>;
}

function DisabledProductionOrderForm() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      <PageHeader 
        title="New Production Order" 
        description="Plan a new manufacturing run."
        backHref="/erp/production"
      />

      <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Finished Product</label>
            <select className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>Select product to manufacture...</option>
              <option>Premium Rice 50kg (PR-50)</option>
              <option>Parboiled Rice 25kg (PB-25)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Quantity (Bags)</label>
            <Input type="number" placeholder="1000" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Start Date</label>
            <Input type="date" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Manufacturing Location</label>
            <select className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>HQ Mill (Lagos)</option>
              <option>Kano Facility</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Estimated Bill of Materials (BOM)</h3>
          <Button variant="outline" size="sm">Edit BOM</Button>
        </div>
        
        <div className="bg-surface-2 p-8 text-center rounded-lg border border-border text-text-muted text-sm">
          Select a Finished Product and Target Quantity to calculate the required raw materials.
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={() => router.push('/production')}>Create Production Order</Button>
      </div>

    </div>
  );
}
