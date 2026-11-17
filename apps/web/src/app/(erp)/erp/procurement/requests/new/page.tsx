'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPRSchema, CreatePRInput } from '@/features/procurement/schemas';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Temporarily disabled until the procurement request workflow is connected.
export default function NewPurchaseRequestPage() {
  return <div className="max-w-3xl space-y-6 pb-20"><PageHeader title="Purchase Requests" description="Creating purchase requests is temporarily unavailable." backHref="/erp/procurement/requests" /></div>;
}

function DisabledPurchaseRequestForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<CreatePRInput>({
    resolver: zodResolver(createPRSchema) as any,
    defaultValues: {
      requestType: 'Raw materials',
      urgency: 'Normal',
      lines: [{ productId: '', quantity: 1, unit: 'pcs', estimatedUnitCost: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines'
  });

  const urgency = watch('urgency');

  const onSubmit = async (data: CreatePRInput) => {
    setIsSubmitting(true);
    try {
      // Simulate API
      await new Promise(res => setTimeout(res, 1000));
      toast.success('Purchase request submitted for approval');
      router.push('/procurement/requests');
    } catch (err: any) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      <PageHeader 
        title="Create Purchase Request" 
        description="Formal request for procurement of materials or goods."
        backHref="/erp/procurement/requests"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Header Information */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-6 py-4 border-b border-border">
            <h3 className="font-medium text-lg">Request Details</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Request Type <span className="text-error">*</span></label>
                <select {...register('requestType')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <option value="Raw materials">Raw materials</option>
                  <option value="Finished goods">Finished goods</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deliver To <span className="text-error">*</span></label>
                <select {...register('deliverToLocationId')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <option value="">Select Warehouse/Location</option>
                  <option value="wh-1">Central Warehouse (Ikeja)</option>
                  <option value="wh-2">Production Floor A</option>
                </select>
                {errors.deliverToLocationId && <p className="text-xs text-error">{errors.deliverToLocationId.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Required By Date <span className="text-error">*</span></label>
                <Input type="date" {...register('requiredByDate')} error={errors.requiredByDate?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Urgency <span className="text-error">*</span></label>
                <select {...register('urgency')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {(urgency === 'High' || urgency === 'Critical') && (
              <div className="space-y-2 p-4 bg-warning-bg/30 border border-warning-border rounded-lg">
                <label className="text-sm font-medium text-warning-dark">Justification Required <span className="text-error">*</span></label>
                <textarea 
                  {...register('justification')} 
                  className="w-full flex min-h-[80px] rounded-md border border-warning-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
                  placeholder="Explain why this request is urgent..."
                />
                {errors.justification && <p className="text-xs text-error">{errors.justification.message}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="font-medium text-lg">Requested Items</h3>
          </div>
          <div className="p-6 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-start p-4 border border-border rounded-lg bg-surface-2/30">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <label className="text-xs font-medium">Product / Material</label>
                  <Input {...register(`lines.${index}.productId`)} placeholder="Search product..." />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <label className="text-xs font-medium">Quantity</label>
                  <Input type="number" {...register(`lines.${index}.quantity`)} min="1" />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <label className="text-xs font-medium">Unit</label>
                  <Input {...register(`lines.${index}.unit`)} placeholder="e.g. kg, pcs" />
                </div>
                <div className="col-span-12 md:col-span-3 space-y-2">
                  <label className="text-xs font-medium">Est. Unit Cost (₦)</label>
                  <Input type="number" {...register(`lines.${index}.estimatedUnitCost`)} />
                </div>
                <div className="col-span-12 md:col-span-1 flex items-end justify-end h-full">
                  <Button type="button" variant="ghost" onClick={() => remove(index)} className="text-error h-10 w-10 p-0">
                    ✕
                  </Button>
                </div>
              </div>
            ))}
            {errors.lines?.root && <p className="text-sm text-error">{errors.lines.root.message}</p>}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => append({ productId: '', quantity: 1, unit: 'pcs', estimatedUnitCost: 0 })}
            >
              + Add Item
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-border pt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/procurement/requests')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>

      </form>
    </div>
  );
}
