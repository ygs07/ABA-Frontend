'use client';

import React from 'react';
import { Control, Controller, FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Percent, Layers, Truck, Receipt } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CommissionPlanFormValues } from '../schemas';

interface CommissionBaseConfigCardProps {
  control: Control<CommissionPlanFormValues>;
  register: UseFormRegister<CommissionPlanFormValues>;
  errors: FieldErrors<CommissionPlanFormValues>;
  watch: UseFormWatch<CommissionPlanFormValues>;
}

export function CommissionBaseConfigCard({
  control,
  register,
  errors,
  watch,
}: CommissionBaseConfigCardProps) {
  const calculationBaseType = watch('calculationBaseType');

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
      <div className="p-6 space-y-6">
        <div className="border-b border-border pb-3">
          <h3 className="font-bold text-lg text-text">Commission Calculation Base</h3>
          <p className="text-xs text-text-muted mt-1">
            Specify how the commissionable amount is determined from customer orders before distributing to network levels.
          </p>
        </div>

        {/* Calculation Base Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-text block">
            Transaction Base Method *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Pool Percentage */}
            <Controller
              control={control}
              name="calculationBaseType"
              render={({ field }) => (
                <label
                  onClick={() => field.onChange('pool_percentage')}
                  className={`flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    field.value === 'pool_percentage'
                      ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-600'
                      : 'border-border bg-surface-1 hover:border-border-hover'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="calculationBaseType"
                      checked={field.value === 'pool_percentage'}
                      onChange={() => field.onChange('pool_percentage')}
                      className="mt-1 h-4 w-4 text-brand-600 border-border focus:ring-brand-500"
                    />
                    <div>
                      <p className="font-semibold text-text text-sm flex items-center gap-1.5">
                        <Percent className="w-4 h-4 text-brand-600" />
                        Defined Transaction Percentage (Pool)
                      </p>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Allocate a fixed percentage of each transaction (e.g. 10%) as the commission pool to be shared by network levels.
                      </p>
                    </div>
                  </div>
                </label>
              )}
            />

            {/* Option 2: Whole Order Amount */}
            <Controller
              control={control}
              name="calculationBaseType"
              render={({ field }) => (
                <label
                  onClick={() => field.onChange('whole_order')}
                  className={`flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    field.value === 'whole_order'
                      ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-600'
                      : 'border-border bg-surface-1 hover:border-border-hover'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="calculationBaseType"
                      checked={field.value === 'whole_order'}
                      onChange={() => field.onChange('whole_order')}
                      className="mt-1 h-4 w-4 text-brand-600 border-border focus:ring-brand-500"
                    />
                    <div>
                      <p className="font-semibold text-text text-sm flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-brand-600" />
                        Whole Order Amount (100%)
                      </p>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Calculate level commission percentages directly against the entire eligible order amount.
                      </p>
                    </div>
                  </div>
                </label>
              )}
            />
          </div>

          {/* Conditional Input for Pool Percentage */}
          {calculationBaseType === 'pool_percentage' && (
            <div className="pt-2">
              <div className="p-4 bg-surface-2 rounded-lg border border-border/70 max-w-md space-y-1.5">
                <label className="text-sm font-semibold text-text flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-brand-600" />
                  Defined Transaction Pool Rate (%) *
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    placeholder="10"
                    className="pr-8"
                    {...register('poolPercentage', { valueAsNumber: true })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                    %
                  </span>
                </div>
                {errors.poolPercentage && (
                  <p className="text-[11px] text-error font-medium">{errors.poolPercentage.message}</p>
                )}
                <p className="text-[11px] text-text-muted">
                  For example, on a ₦100,000 order, a 10% pool allocates ₦10,000 for all network tier commissions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Inclusions and Deductions: Shipping & Tax */}
        <div className="pt-4 border-t border-border space-y-3">
          <label className="text-sm font-medium text-text block">
            Order Adjustments (Inclusions & Deductions)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Include Shipping */}
            <div className="p-3.5 bg-surface-1 rounded-lg border border-border flex items-start gap-3">
              <Controller
                control={control}
                name="includeShipping"
                render={({ field }) => (
                  <Checkbox
                    id="includeShipping"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    className="mt-0.5"
                  />
                )}
              />
              <div className="text-sm">
                <label htmlFor="includeShipping" className="font-medium text-text cursor-pointer flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-text-muted" />
                  Include Shipping / Delivery Fees
                </label>
                <p className="text-xs text-text-muted mt-0.5">
                  When unchecked, delivery charges are excluded from the commissionable amount.
                </p>
              </div>
            </div>

            {/* Include Tax */}
            <div className="p-3.5 bg-surface-1 rounded-lg border border-border flex items-start gap-3">
              <Controller
                control={control}
                name="includeTax"
                render={({ field }) => (
                  <Checkbox
                    id="includeTax"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    className="mt-0.5"
                  />
                )}
              />
              <div className="text-sm">
                <label htmlFor="includeTax" className="font-medium text-text cursor-pointer flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-text-muted" />
                  Include Taxes (VAT)
                </label>
                <p className="text-xs text-text-muted mt-0.5">
                  When unchecked, VAT and sales taxes are deducted before calculating commission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
