'use client';
import { brand } from '@/config/brand';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMerchantSchema, CreateMerchantInput } from '@/features/merchants/schemas';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createMerchant } from '@/features/merchant/api';

import { ImageUploadField } from '@/components/patterns/ImageUploadField';

export default function NewMerchantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateMerchantInput>({
    resolver: zodResolver(createMerchantSchema),
    defaultValues: {
      type: 'Partner',
    }
  });

  const logoUrl = watch('logoUrl');
  const bannerImage = watch('bannerImage');

  const onSubmit = async (data: CreateMerchantInput) => {
    setIsSubmitting(true);
    try {
      const newMerchant = await createMerchant(data);
      toast.success('Merchant created and submitted for approval');
      router.push(`/erp/merchants/${newMerchant?.data?.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to onboard merchant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <PageHeader 
        title="Onboard Merchant" 
        description="Register a new retail outlet or partner."
        backHref="/erp/merchants"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Business */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-6 py-4 border-b border-border">
            <h3 className="font-medium text-lg">Business Details</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Merchant Owner Account</label>
              <p className="text-xs text-text-muted">A user account is created with the details below when this merchant is submitted.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner First Name <span className="text-error">*</span></label>
                <Input {...register('userFirstName')} placeholder="Amina" error={errors.userFirstName?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner Last Name <span className="text-error">*</span></label>
                <Input {...register('userLastName')} placeholder="Yusuf" error={errors.userLastName?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username <span className="text-error">*</span></label>
                <Input {...register('userUsername')} placeholder="amina.yusuf" error={errors.userUsername?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Password <span className="text-error">*</span></label>
                <Input type="password" {...register('userPassword')} error={errors.userPassword?.message} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Name <span className="text-error">*</span></label>
                <Input {...register('name')} placeholder={`e.g. ${brand.name} Hub Ikeja`} error={errors.name?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Legal Name <span className="text-error">*</span></label>
                <Input {...register('legalName')} placeholder={`${brand.name} Hub Nigeria Ltd`} error={errors.legalName?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Merchant Type <span className="text-error">*</span></label>
                <select {...register('type')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <option value="Own outlet">Own outlet</option>
                  <option value="Franchise">Franchise</option>
                  <option value="Partner">Partner</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">RC / Tax ID (Optional)</label>
                <Input {...register('rcNumber')} placeholder="RC123456" error={errors.rcNumber?.message} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-6 py-4 border-b border-border">
            <h3 className="font-medium text-lg">Contact Information</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner Name <span className="text-error">*</span></label>
                <Input {...register('ownerName')} placeholder="John Doe" error={errors.ownerName?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number <span className="text-error">*</span></label>
                <Input {...register('phone')} placeholder="+2348000000000" error={errors.phone?.message} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address <span className="text-error">*</span></label>
                <Input type="email" {...register('email')} placeholder="store@example.com" error={errors.email?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website (Optional)</label>
                <Input {...register('website')} placeholder="https://..." error={errors.website?.message} />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-6 py-4 border-b border-border">
            <h3 className="font-medium text-lg">Physical Location</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Street Address <span className="text-error">*</span></label>
              <Input {...register('address')} placeholder="123 Main Street" error={errors.address?.message} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">City <span className="text-error">*</span></label>
                <Input {...register('city')} placeholder="Ikeja" error={errors.city?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State <span className="text-error">*</span></label>
                <Input {...register('state')} placeholder="Lagos" error={errors.state?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">LGA (Optional)</label>
                <Input {...register('lga')} placeholder="Ikeja LGA" error={errors.lga?.message} />
              </div>
            </div>
          </div>
        </div>

        {/* Branding & Media */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-6 py-4 border-b border-border">
            <h3 className="font-medium text-lg">Branding & Storefront Media</h3>
            <p className="text-xs text-text-muted mt-0.5">Upload vendor brand assets displayed on the public storefront and receipts.</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField
                label="Store Logo / Brand Avatar"
                description="Square logo displayed on badges, listings, and checkout."
                aspectRatio="square"
                maxFiles={1}
                values={logoUrl ? [logoUrl] : []}
                onChange={(urls) => setValue('logoUrl', urls[0] || '')}
              />
              <ImageUploadField
                label="Storefront Cover Banner"
                description="Header banner displayed on the merchant profile page."
                aspectRatio="banner"
                maxFiles={1}
                values={bannerImage ? [bannerImage] : []}
                onChange={(urls) => setValue('bannerImage', urls[0] || '')}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-border pt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/merchants')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>

      </form>
    </div>
  );
}
