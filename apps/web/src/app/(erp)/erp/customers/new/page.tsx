'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomerSchema, CreateCustomerInput } from '@/features/customers/schemas';
import { createCustomer } from '@/features/customers/api/customers.api';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function NewCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema) as any,
  });

  const onSubmit = async (data: CreateCustomerInput) => {
    setIsSubmitting(true);
    try {
      const customer = await createCustomer(data);
      toast.success('Customer profile created successfully');
      router.push(`/erp/customers/${customer.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 pb-20">
      <PageHeader
        title="Add Customer"
        description="Register an existing user account as a customer. User profile details are managed from the user account."
        backHref="/erp/customers"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border bg-surface-2 px-6 py-4">
            <h3 className="text-lg font-medium">Customer account</h3>
          </div>
          <div className="space-y-6 p-6">
            <p className="text-sm text-text-muted">
              A customer is linked one-to-one with a user account. Enter the ID of an existing user who does not already have a customer profile.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="userId">User ID <span className="text-error">*</span></label>
              <Input id="userId" type="number" min="1" inputMode="numeric" placeholder="e.g. 42" {...register('userId')} error={errors.userId?.message} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="referralCode">Referral code <span className="text-text-muted">(optional)</span></label>
              <Input id="referralCode" placeholder="e.g. BNG-REFER-123" {...register('referralCode')} error={errors.referralCode?.message} />
              <p className="text-xs text-text-muted">When provided, the customer is placed in the referral network for this code.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-border pt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/erp/customers')} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Create Customer Profile'}</Button>
        </div>
      </form>
    </div>
  );
}
