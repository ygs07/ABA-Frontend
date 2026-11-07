'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  createAdjustmentSchema,
  CreateAdjustmentInput,
} from '@/features/inventory/schemas';

import {
  adjustProductStock,
  adjustStock,
  getProductVariants,
  getStockRecords,
  ProductVariantOption,
  StockAdjustmentRecord,
} from '@/features/inventory/api/inventory.api';

import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function stockLabel(stockRecord: StockAdjustmentRecord) {
  const productName =
    stockRecord.productVariant?.product?.name ??
    stockRecord.product?.name ??
    'Product';

  const variantName = stockRecord.productVariant?.name;

  return `${productName}${variantName ? ` — ${variantName}` : ''} (${stockRecord.sku})`;
}

function NewAdjustmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get('productId');
  const stockId = searchParams.get('stockId');

  const [stockRecords, setStockRecords] = useState<
    StockAdjustmentRecord[]
  >([]);
  const [productVariants, setProductVariants] = useState<ProductVariantOption[]>([]);

  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAdjustmentInput>({
    resolver: zodResolver(createAdjustmentSchema) as any,
    defaultValues: {
      stockId: '',
      productVariantId: '',
      quantityChange: 1,
      reason: 'Damaged',
      notes: '',
    },
  });

  const selectedStockId = watch('stockId');
  const selectedProductVariantId = watch('productVariantId');
  const quantityChange = watch('quantityChange');

  const selectedStock = stockRecords.find(
    (stockRecord) => String(stockRecord.id) === selectedStockId,
  );

  const selectedProductId = productId
    ? Number(productId)
    : undefined;

  const availableStockRecords = productId
    ? stockRecords.filter(
        (stockRecord) =>
          String(stockRecord.product?.id) === productId ||
          String(stockRecord.productVariant?.product?.id) === productId,
      )
    : stockRecords;

  useEffect(() => {
    Promise.all([
      getStockRecords(),
      productId ? getProductVariants(Number(productId)) : Promise.resolve([]),
    ])
      .then(([loadedStockRecords, loadedProductVariants]) => {
        setStockRecords(loadedStockRecords);
        setProductVariants(loadedProductVariants);

        const matchingStockRecord = stockId
          ? loadedStockRecords.find(
              (stockRecord) => String(stockRecord.id) === stockId,
            )
          : productId && !loadedProductVariants.length
            ? loadedStockRecords.find(
                (stockRecord) =>
                  String(stockRecord.product?.id) === productId ||
                  String(stockRecord.productVariant?.product?.id) ===
                    productId,
              )
            : undefined;

        if (matchingStockRecord) {
          setValue('stockId', String(matchingStockRecord.id));
        }
      })
      .catch(() => {
        toast.error('Failed to load stock records');
      })
      .finally(() => {
        setIsLoadingStocks(false);
      });
  }, [productId, setValue, stockId]);

  const onSubmit = async (data: CreateAdjustmentInput) => {
    setIsSubmitting(true);

    try {
      const updatedStock = data.stockId
        ? await adjustStock(
            Number(data.stockId),
            data.quantityChange,
          )
        : selectedProductId
          ? await adjustProductStock(
              selectedProductId,
              data.quantityChange,
              data.productVariantId ? Number(data.productVariantId) : undefined,
            )
          : null;

      if (!updatedStock) {
        throw new Error('Select a stock item to adjust');
      }

      toast.success(
        `Stock adjusted. New quantity: ${updatedStock.quantity}`,
      );

      router.push('/erp/inventory/stock');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to adjust stock',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-20">
      <PageHeader
        title="Stock Adjustment"
        description="Increase or decrease the quantity of one stock record."
        backHref="/erp/inventory/stock"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-6 py-4 border-b border-border">
            <h3 className="font-medium text-lg">
              Adjustment details
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Stock item */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Stock item{' '}
                {!productId && (
                  <span className="text-error">*</span>
                )}
              </label>

              <select
                {...register('stockId')}
                disabled={isLoadingStocks || isSubmitting}
                className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                <option value="">
                  {isLoadingStocks
                    ? 'Loading stock records…'
                    : productId
                      ? 'No stock record yet — this adjustment will create one'
                      : 'Select a stock item'}
                </option>

                {availableStockRecords.map((stockRecord) => (
                  <option
                    key={stockRecord.id}
                    value={stockRecord.id}
                  >
                    {stockLabel(stockRecord)} — {stockRecord.quantity} on hand
                  </option>
                ))}
              </select>

              {!productId && errors.stockId?.message && (
                <p className="text-xs text-error">
                  {errors.stockId.message}
                </p>
              )}
            </div>

            {/* Current and projected quantity */}
            {selectedStock && (
              <div className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">
                <span className="text-text-muted">
                  Current quantity:{' '}
                </span>

                <span className="font-semibold">
                  {selectedStock.quantity}
                </span>

                {typeof quantityChange === 'number' &&
                  quantityChange !== 0 && (
                    <>
                      <span className="text-text-muted">
                        {' '}→ projected quantity:{' '}
                      </span>

                      <span
                        className={
                          selectedStock.quantity + quantityChange < 0
                            ? 'font-semibold text-error'
                            : 'font-semibold'
                        }
                      >
                        {selectedStock.quantity + quantityChange}
                      </span>
                    </>
                  )}
              </div>
            )}

            {selectedProductId && productVariants.length > 0 && !selectedStock && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Product variant <span className="text-error">*</span>
                </label>
                <select
                  {...register('productVariantId')}
                  disabled={isLoadingStocks || isSubmitting}
                  className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  <option value="">Select a variant to adjust</option>
                  {productVariants.map((productVariant) => (
                    <option key={productVariant.id} value={productVariant.id}>
                      {productVariant.name} ({productVariant.sku})
                    </option>
                  ))}
                </select>
                {!selectedProductVariantId && (
                  <p className="text-xs text-text-muted">
                    Stock is tracked separately for each variant.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity change */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Quantity change{' '}
                  <span className="text-error">*</span>
                </label>

                <Input
                  type="number"
                  {...register('quantityChange')}
                  placeholder="Use -3 to deduct or 10 to add"
                  disabled={isSubmitting}
                />

                <p className="text-xs text-text-muted">
                  Use a positive number to add stock or a negative
                  number to deduct it.
                </p>

                {errors.quantityChange?.message && (
                  <p className="text-xs text-error">
                    {errors.quantityChange.message}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Reason <span className="text-error">*</span>
                </label>

                <select
                  {...register('reason')}
                  disabled={isSubmitting}
                  className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  <option value="Damaged">Damaged</option>
                  <option value="Expired">Expired</option>
                  <option value="Found">Found</option>
                  <option value="Written off">Written off</option>
                  <option value="Stock count correction">
                    Stock count correction
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Additional notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Additional notes
              </label>

              <Input
                {...register('notes')}
                placeholder="Optional context for this adjustment"
                disabled={isSubmitting}
              />

              <p className="text-xs text-text-muted">
                Reason and notes will be stored once stock
                movements/auditing are introduced.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/erp/inventory/stock')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingStocks ||
              (!!selectedProductId && productVariants.length > 0 && !selectedStock && !selectedProductVariantId)
            }
          >
            Apply adjustment
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewAdjustmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewAdjustmentForm />
    </Suspense>
  );
}
