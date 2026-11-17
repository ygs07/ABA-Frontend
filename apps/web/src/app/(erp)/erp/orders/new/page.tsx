'use client';
import { brand } from '@/config/brand';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrderSchema, CreateOrderInput } from '@/features/sales/schemas';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountText } from '@/components/patterns/AmountText';
import { toast } from 'sonner';

// Temporarily disabled until manual ERP order creation is connected.
export default function NewOrderPage() {
  return <div className="max-w-3xl space-y-6 pb-20"><PageHeader title="Orders" description="Creating orders from the ERP is temporarily unavailable." backHref="/erp/orders" /></div>;
}

function DisabledOrderForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema) as any,
    defaultValues: {
      channel: 'Admin',
      deliveryMethod: 'Pickup',
      paymentOption: 'Pay now',
      lines: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 7.5 }],
      deliveryFee: 0,
      orderDiscount: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines'
  });

  const watchLines = watch('lines');
  const watchDelivery = watch('deliveryFee') || 0;
  const watchOrderDiscount = watch('orderDiscount') || 0;
  const watchDeliveryMethod = watch('deliveryMethod');
  const watchPaymentOption = watch('paymentOption');

  // Compute Line Totals and overall Totals
  const subtotal = watchLines.reduce((acc, line) => acc + (line.quantity * (line.unitPrice || 0)), 0);
  const totalTax = watchLines.reduce((acc, line) => acc + (line.quantity * (line.unitPrice || 0) * (line.taxRate / 100)), 0);
  const totalLineDiscounts = watchLines.reduce((acc, line) => acc + (line.discount || 0), 0);
  
  const finalTotal = subtotal + totalTax - totalLineDiscounts - Number(watchOrderDiscount) + Number(watchDelivery);

  const onSubmit = async (data: CreateOrderInput) => {
    setIsSubmitting(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      toast.success('Order placed successfully');
      router.push('/erp/orders');
    } catch (err: any) {
      toast.error('Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <PageHeader 
        title="Create Order" 
        description="Draft a new sales order manually."
        backHref="/erp/orders"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Form Details */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Customer & Origin */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="bg-surface-2 px-6 py-4 border-b border-border">
              <h3 className="font-medium text-lg">Customer & Origin</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name <span className="text-error">*</span></label>
                  <div className="flex gap-2">
                    <Input {...register('customerName')} placeholder="Search or enter name..." className="flex-1" />
                    <Button type="button" variant="outline" className="shrink-0">+ New</Button>
                  </div>
                  {errors.customerName && <p className="text-xs text-error">{errors.customerName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Phone</label>
                  <Input {...register('customerPhone')} placeholder="+234..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Merchant Source <span className="text-error">*</span></label>
                  <select {...register('merchantId')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option value="">Select merchant</option>
                    <option value="mer-1">{brand.name} HQ Store</option>
                    <option value="mer-2">Ikeja Branch</option>
                  </select>
                  {errors.merchantId && <p className="text-xs text-error">{errors.merchantId.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Channel</label>
                  <select {...register('channel')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option value="Admin">Admin / Phone</option>
                    <option value="Web">Website (Draft)</option>
                    <option value="POS">POS (Override)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="bg-surface-2 px-6 py-4 border-b border-border">
              <h3 className="font-medium text-lg">Order Items</h3>
            </div>
            
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-3 font-medium w-[250px]">Product / Variant</th>
                    <th className="pb-3 font-medium w-[100px]">Qty</th>
                    <th className="pb-3 font-medium w-[150px]">Unit Price (₦)</th>
                    <th className="pb-3 font-medium w-[150px]">Discount (₦)</th>
                    <th className="pb-3 font-medium text-right w-[150px]">Total</th>
                    <th className="pb-3 w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fields.map((field, index) => {
                    const qty = watchLines[index]?.quantity || 0;
                    const price = watchLines[index]?.unitPrice || 0;
                    const taxRate = watchLines[index]?.taxRate || 0;
                    const disc = watchLines[index]?.discount || 0;
                    const lineTotal = (qty * price) + (qty * price * (taxRate/100)) - disc;

                    return (
                      <tr key={field.id}>
                        <td className="py-3 pr-2">
                          <Input {...register(`lines.${index}.productId`)} placeholder="Search..." className="h-9" />
                        </td>
                        <td className="py-3 px-2">
                          <Input type="number" {...register(`lines.${index}.quantity`)} min="1" className="h-9" />
                        </td>
                        <td className="py-3 px-2">
                          <Input type="number" {...register(`lines.${index}.unitPrice`)} className="h-9" />
                        </td>
                        <td className="py-3 px-2">
                          <Input type="number" {...register(`lines.${index}.discount`)} className="h-9" />
                        </td>
                        <td className="py-3 pl-2 text-right font-medium">
                          <AmountText amountInKobo={lineTotal} />
                        </td>
                        <td className="py-3 text-right">
                          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-error px-2 h-9">
                            ✕
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="mt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 7.5 })}>
                  + Add Item
                </Button>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="bg-surface-2 px-6 py-4 border-b border-border">
              <h3 className="font-medium text-lg">Fulfilment & Delivery</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Method <span className="text-error">*</span></label>
                  <select {...register('deliveryMethod')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option value="Pickup">Pickup at store</option>
                    <option value="Delivery">Delivery / Dispatch</option>
                  </select>
                </div>
                {watchDeliveryMethod === 'Delivery' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expected Date</label>
                    <Input type="date" {...register('expectedDeliveryDate')} />
                  </div>
                )}
              </div>
              
              {watchDeliveryMethod === 'Delivery' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Delivery Address</label>
                  <Input {...register('deliveryAddress')} placeholder="Enter full address..." />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Summary */}
        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-border overflow-hidden sticky top-6">
            <div className="bg-surface-2 px-6 py-4 border-b border-border">
              <h3 className="font-medium text-lg">Order Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal ({watchLines.length} items)</span>
                  <span><AmountText amountInKobo={subtotal} /></span>
                </div>
                
                <div className="flex justify-between text-sm items-center">
                  <span className="text-text-muted">Order Discount</span>
                  <Input type="number" {...register('orderDiscount')} className="w-24 h-8 text-right" placeholder="₦" />
                </div>
                
                <div className="flex justify-between text-sm items-center">
                  <span className="text-text-muted">Delivery Fee</span>
                  <Input type="number" {...register('deliveryFee')} disabled={watchDeliveryMethod === 'Pickup'} className="w-24 h-8 text-right" placeholder="₦" />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">VAT (7.5%)</span>
                  <span><AmountText amountInKobo={totalTax} /></span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between font-medium text-xl">
                <span>Total</span>
                <span className="text-primary"><AmountText amountInKobo={finalTotal} /></span>
              </div>

              <div className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Collection</label>
                  <select {...register('paymentOption')} className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option value="Pay now">Collect Payment Now</option>
                    <option value="Pay later">Pay Later (Credit/Invoice)</option>
                    <option value="Partial">Partial Deposit</option>
                  </select>
                  {watchPaymentOption === 'Pay later' && (
                    <p className="text-xs text-warning-dark mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-warning-bg border border-warning-border inline-flex items-center justify-center font-bold">!</span>
                      Customer credit limit will be verified.
                    </p>
                  )}
                </div>
                
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
                <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                  Save as Draft
                </Button>
              </div>

            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
