'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createProductVariant, CreateProductVariantInput, getProductById, updateProduct, UpdateProductInput } from '@/features/products/api/products.api';
import { Product, ProductVariant } from '@/features/products/types';
import { toast } from 'sonner';

function toInput(product: Product): UpdateProductInput {
  return {
    name: product.name,
    description: product.description ?? '',
    baseCostPrice: product.price / 100,
    baseSellingPrice: product.sellingPrice / 100,
    baseUnitOfMeasurement: product.unitOfMeasure,
    type: product.type,
    reorderLevel: product.reorderLevel,
    reorderQuantity: product.reorderQuantity,
    isActive: product.status === 'Active',
  };
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [values, setValues] = useState<UpdateProductInput | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState<CreateProductVariantInput>({ name: '', sku: '', barcode: '', price: 0, costPrice: 0, isActive: true });
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  useEffect(() => {
    getProductById(id).then((product) => { setValues(toInput(product)); setVariants(product.variants ?? []); }).catch(() => {
      toast.error('Product not found.');
      router.replace('/erp/products');
    });
  }, [id, router]);

  const update = <Key extends keyof UpdateProductInput>(key: Key, value: UpdateProductInput[Key]) => {
    setValues((current) => current ? { ...current, [key]: value } : current);
  };
  const updateNewVariant = <Key extends keyof CreateProductVariantInput>(key: Key, value: CreateProductVariantInput[Key]) => {
    setNewVariant((current) => ({ ...current, [key]: value }));
  };
  const addVariant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newVariant.name.trim() || newVariant.price < 0) {
      toast.error('Enter a variant name and valid selling price.');
      return;
    }
    setIsAddingVariant(true);
    try {
      const variant = await createProductVariant(id, newVariant);
      setVariants((current) => [...current, variant]);
      setNewVariant({ name: '', sku: '', barcode: '', price: 0, costPrice: 0, isActive: true });
      toast.success('Variant added.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add variant.');
    } finally {
      setIsAddingVariant(false);
    }
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values) return;
    setIsSaving(true);
    try {
      await updateProduct(id, values);
      toast.success('Product updated.');
      router.push(`/erp/products/${encodeURIComponent(id)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update product.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!values) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>;

  return <div className="max-w-3xl space-y-6 pb-20"><PageHeader title="Edit Product" description="Update your product catalogue details." backHref={`/erp/products/${id}`} />
    <form onSubmit={save} className="space-y-6 rounded-xl border border-border bg-surface p-6">
      <div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-medium">Product name<Input required value={values.name} onChange={(event) => update('name', event.target.value)} className="mt-1" /></label><label className="text-sm font-medium">Status<select value={values.isActive ? 'active' : 'inactive'} onChange={(event) => update('isActive', event.target.value === 'active')} className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>
      <label className="block text-sm font-medium">Description<textarea value={values.description} onChange={(event) => update('description', event.target.value)} className="mt-1 min-h-28 w-full rounded-md border border-border p-3 text-sm" /></label>
      <div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-medium">Product type<select value={values.type} onChange={(event) => update('type', event.target.value as Product['type'])} className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"><option>Finished good</option><option>Raw material</option><option>Service</option><option>Bundle</option></select></label><label className="text-sm font-medium">Unit of measurement<Input required value={values.baseUnitOfMeasurement} onChange={(event) => update('baseUnitOfMeasurement', event.target.value)} className="mt-1" /></label></div>
      <div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-medium">Cost price (₦)<Input required min="0" step="0.01" type="number" value={values.baseCostPrice} onChange={(event) => update('baseCostPrice', Number(event.target.value))} className="mt-1" /></label><label className="text-sm font-medium">Selling price (₦)<Input required min="0" step="0.01" type="number" value={values.baseSellingPrice} onChange={(event) => update('baseSellingPrice', Number(event.target.value))} className="mt-1" /></label></div>
      <div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-medium">Reorder level<Input required min="0" type="number" value={values.reorderLevel} onChange={(event) => update('reorderLevel', Number(event.target.value))} className="mt-1" /></label><label className="text-sm font-medium">Reorder quantity<Input required min="0" type="number" value={values.reorderQuantity} onChange={(event) => update('reorderQuantity', Number(event.target.value))} className="mt-1" /></label></div>
      <div className="flex gap-3 border-t border-border pt-5"><Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</Button></div>
    </form>
    <section className="space-y-5 rounded-xl border border-border bg-surface p-6">
      <div><h2 className="font-semibold">Product variants</h2><p className="mt-1 text-sm text-text-muted">Add purchasable options such as size, colour, or capacity. The SKU is generated when omitted.</p></div>
      {variants.length > 0 && <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full text-sm"><thead className="bg-surface-2 text-left text-xs text-text-muted"><tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Price</th><th className="px-3 py-2">Status</th></tr></thead><tbody>{variants.map((variant) => <tr key={variant.id} className="border-t border-border"><td className="px-3 py-2 font-medium">{variant.name}</td><td className="px-3 py-2 font-mono text-xs">{variant.sku}</td><td className="px-3 py-2">₦{(variant.price / 100).toLocaleString()}</td><td className="px-3 py-2">{variant.isActive ? 'Active' : 'Inactive'}</td></tr>)}</tbody></table></div>}
      <form onSubmit={addVariant} className="grid gap-4 rounded-lg border border-dashed border-border bg-surface-2 p-4 md:grid-cols-2">
        <label className="text-sm font-medium">Variant name<Input required placeholder="e.g. Large / Blue" value={newVariant.name} onChange={(event) => updateNewVariant('name', event.target.value)} className="mt-1" /></label>
        <label className="text-sm font-medium">SKU <span className="font-normal text-text-muted">(optional)</span><Input placeholder="Generated when blank" value={newVariant.sku ?? ''} onChange={(event) => updateNewVariant('sku', event.target.value)} className="mt-1" /></label>
        <label className="text-sm font-medium">Barcode <span className="font-normal text-text-muted">(optional)</span><Input value={newVariant.barcode ?? ''} onChange={(event) => updateNewVariant('barcode', event.target.value)} className="mt-1" /></label>
        <label className="text-sm font-medium">Selling price (₦)<Input required type="number" min="0" step="0.01" value={newVariant.price} onChange={(event) => updateNewVariant('price', Number(event.target.value))} className="mt-1" /></label>
        <label className="text-sm font-medium">Cost price (₦) <span className="font-normal text-text-muted">(optional)</span><Input type="number" min="0" step="0.01" value={newVariant.costPrice ?? ''} onChange={(event) => updateNewVariant('costPrice', event.target.value === '' ? undefined : Number(event.target.value))} className="mt-1" /></label>
        <label className="flex items-end gap-2 pb-2 text-sm font-medium"><input type="checkbox" checked={newVariant.isActive ?? true} onChange={(event) => updateNewVariant('isActive', event.target.checked)} />Active</label>
        <div className="md:col-span-2"><Button type="submit" loading={isAddingVariant}>Add variant</Button></div>
      </form>
    </section>
  </div>;
}
