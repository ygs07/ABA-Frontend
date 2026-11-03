'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, CreateProductInput } from '@/features/products/schemas';
import { createProduct, getProductBrands } from '@/features/products/api/products.api';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getCategories } from '@/features/category/api';
import { getMerchants } from '@/features/merchant/api';
import { useAuthStore } from '@/features/auth/store';
import { ProductImagesSection } from '@/features/products/components/ProductImagesSection';
import { ProductPricingSection } from '@/features/products/components/ProductPricingSection';
import { ProductVariantsSection } from '@/features/products/components/ProductVariantsSection';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeRole = useAuthStore((state) => state.activeRole);
  const canSelectVendor = activeRole === 'Admin' || activeRole === 'Super Admin';
  const { data: categoriesData } = useQuery({ queryKey: ['product-categories'], queryFn: getCategories });
  const { data: brandsData } = useQuery({ queryKey: ['product-brands'], queryFn: getProductBrands });
  const { data: vendorsData } = useQuery({ queryKey: ['vendors'], queryFn: getMerchants, enabled: canSelectVendor });

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as Resolver<CreateProductInput>,
    defaultValues: {
      type: 'Finished good',
      status: 'Draft',
      cost: 0,
      sellingPrice: 0,
      images: [],
      hasVariants: false,
      trackInventory: true,
      priceIncludesTax: true,
    }
  });

  const type = watch('type');
  const hasVariants = watch('hasVariants');
  const cost = watch('cost');
  const sellingPrice = watch('sellingPrice');
  const images = watch('images') || [];

  const onSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    try {
      const newProduct = await createProduct(data);
      toast.success('Product created successfully');
      router.push(`/erp/products/${newProduct.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create product';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      <PageHeader 
        title="Add Product" 
        description="Create a new item in the catalogue."
        backHref="/erp/products"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* A. Basic Information */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-6 py-4 border-b border-border">
            <h3 className="font-medium text-lg">Basic Information</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Type <span className="text-error">*</span></label>
                <select {...register('type')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none">
                  <option value="Finished good">Finished good</option>
                  <option value="Raw material">Raw material</option>
                  <option value="Service">Service</option>
                  <option value="Bundle">Bundle</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status <span className="text-error">*</span></label>
                <select {...register('status')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none">
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name <span className="text-error">*</span></label>
                <Input {...register('name')} placeholder="e.g. Premium Cotton T-Shirt" error={errors.name?.message} />
              </div>
              {canSelectVendor && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vendor</label>
                  <select {...register('vendorId')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm">
                    <option value="">Select a vendor</option>
                    {vendorsData?.data.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category <span className="text-error">*</span></label>
                <select {...register('categoryId')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm">
                  <option value="">Select a category</option>
                  {categoriesData?.data.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {errors.categoryId?.message && <p className="text-sm text-error">{errors.categoryId.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit of Measure <span className="text-error">*</span></label>
                <select {...register('unitOfMeasure')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm">
                  <option value="">Select a unit</option>
                  <option value="piece">Piece</option>
                  <option value="pair">Pair</option>
                  <option value="pack">Pack</option>
                  <option value="box">Box</option>
                  <option value="set">Set</option>
                  <option value="dozen">Dozen</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="litre">Litre</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="metre">Metre</option>
                  <option value="cm">Centimetre (cm)</option>
                </select>
                {errors.unitOfMeasure?.message && <p className="text-sm text-error">{errors.unitOfMeasure.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand (Optional)</label>
                <select {...register('brandId')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm">
                  <option value="">No brand</option>
                  {brandsData?.data.map((productBrand) => (
                    <option key={productBrand.id} value={productBrand.id}>
                      {productBrand.name}{productBrand.is_verified ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
                {errors.brandId?.message && <p className="text-sm text-error">{errors.brandId.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* B. Product Images & Media */}
        <ProductImagesSection
          images={images}
          onChange={(newImages) => setValue('images', newImages)}
          disabled={isSubmitting}
        />

        {/* C. Pricing */}
        <ProductPricingSection
          type={type}
          cost={cost}
          sellingPrice={sellingPrice}
          register={register}
          errors={errors}
        />

        {/* D. Variants */}
        <ProductVariantsSection
          type={type}
          hasVariants={hasVariants}
          cost={cost}
          sellingPrice={sellingPrice}
          register={register}
          control={control}
        />

        {/* E. Inventory Settings */}
        {type !== 'Service' && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="bg-surface-2 px-6 py-4 border-b border-border">
              <h3 className="font-medium text-lg">Inventory Settings</h3>
            </div>
            <div className="p-6 space-y-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('trackInventory')} className="rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Track inventory for this product</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reorder Level</label>
                  <Input type="number" {...register('reorderLevel')} min="0" error={errors.reorderLevel?.message} />
                  <p className="text-xs text-text-muted">System will warn when stock drops below this level.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reorder Quantity</label>
                  <Input type="number" {...register('reorderQuantity')} min="0" error={errors.reorderQuantity?.message} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 border-t border-border pt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/erp/products')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>

      </form>
    </div>
  );
}
