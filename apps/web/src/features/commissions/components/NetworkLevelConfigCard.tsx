'use client';

import React from 'react';
import { Control, Controller, FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Trash2, Percent, Calendar, ShieldCheck, Clock, Building2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  CommissionPlanFormValues,
  qualificationTriggerOptions,
  approvalModeOptions,
} from '../schemas';

interface NetworkLevelConfigCardProps {
  index: number;
  levelNumber: number;
  register: UseFormRegister<CommissionPlanFormValues>;
  control: Control<CommissionPlanFormValues>;
  errors: FieldErrors<CommissionPlanFormValues>;
  watch: UseFormWatch<CommissionPlanFormValues>;
  onRemove?: () => void;
  canRemove: boolean;
}

export function NetworkLevelConfigCard({
  index,
  levelNumber,
  register,
  control,
  errors,
  watch,
  onRemove,
  canRemove,
}: NetworkLevelConfigCardProps) {
  const levelErrors = errors.networkLevels?.[index];
  const systemRateVal = watch(`networkLevels.${index}.systemRate`);
  const merchantRateVal = watch(`networkLevels.${index}.rate`);
  const safeSystemRate = Number.isFinite(systemRateVal) ? systemRateVal : 0;
  const safeMerchantRate = Number.isFinite(merchantRateVal) ? merchantRateVal : 0;
  const combinedRate = Number((safeSystemRate + safeMerchantRate).toFixed(2));

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-5 shadow-xs transition-all hover:border-brand-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {levelNumber}
          </span>
          <div>
            <h4 className="font-bold text-text text-base">Network Level {levelNumber}</h4>
            <p className="text-xs text-text-muted">
              {levelNumber === 1
                ? 'Direct referrer earning rule'
                : `Tier ${levelNumber} indirect upline earning rule`}
            </p>
          </div>
        </div>

        {canRemove && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-error hover:text-error-hover hover:bg-error-bg/20 h-8 px-2 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Remove Level
          </Button>
        )}
      </div>

      {/* Commission Allocation Split: System (Platform) vs Merchant (Marketer) */}
      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-brand-600" />
            Level {levelNumber} Commission Split (System Always Earns)
          </p>
          <span className="text-xs font-medium text-text-muted">
            System: <strong className="text-text">{safeSystemRate}%</strong> · Merchant:{' '}
            <strong className="text-text">{safeMerchantRate}%</strong> · Combined:{' '}
            <strong className={combinedRate > 100 ? 'text-error' : 'text-brand-700'}>
              {combinedRate}%
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              System Retained (%) *
            </label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              placeholder="e.g. 2"
              {...register(`networkLevels.${index}.systemRate`, { valueAsNumber: true })}
            />
            {levelErrors?.systemRate && (
              <p className="text-[11px] text-error font-medium">{levelErrors.systemRate.message}</p>
            )}
            <p className="text-[11px] text-text-muted">
              Mandatory platform share retained at Level {levelNumber}.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              Merchant / Marketer (%) *
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 5"
              {...register(`networkLevels.${index}.rate`, { valueAsNumber: true })}
            />
            {levelErrors?.rate && (
              <p className="text-[11px] text-error font-medium">{levelErrors.rate.message}</p>
            )}
            <p className="text-[11px] text-text-muted">
              Percentage allocated to the merchant/marketer at Level {levelNumber}.
            </p>
          </div>
        </div>
      </div>

      {/* Qualification Trigger */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
          Qualification Trigger *
        </label>
        <Controller
          control={control}
          name={`networkLevels.${index}.qualificationTrigger`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Trigger" />
              </SelectTrigger>
              <SelectContent>
                {qualificationTriggerOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-[11px] text-text-muted">Event required to qualify for this level reward.</p>
      </div>

      {/* Date constraints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            Effective From (Optional)
          </label>
          <Input type="date" {...register(`networkLevels.${index}.effectiveFrom`)} />
          <p className="text-[11px] text-text-muted">
            Takes effect from beginning of commission plan if left empty.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            Effective To (Optional)
          </label>
          <Input type="date" {...register(`networkLevels.${index}.effectiveTo`)} />
          <p className="text-[11px] text-text-muted">
            Active until end of commission plan if left empty.
          </p>
        </div>
      </div>

      {/* Operational constraints: Min order value, approval mode, payout delay */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">Minimum Order Value (Optional)</label>
          <Input
            type="number"
            min="0"
            placeholder="₦ 0"
            {...register(`networkLevels.${index}.minOrderValue`, {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
          />
          <p className="text-[11px] text-text-muted">Orders below this do not qualify.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">Approval Mode (Optional)</label>
          <Controller
            control={control}
            name={`networkLevels.${index}.approvalMode`}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || 'auto'}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Approval Mode" />
                </SelectTrigger>
                <SelectContent>
                  {approvalModeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-[11px] text-text-muted">Auto Approval vs Manual review.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            Payout Delay (Optional)
          </label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 7"
            {...register(`networkLevels.${index}.payoutDelay`, {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
          />
          <p className="text-[11px] text-text-muted">Days to hold from trigger before payout.</p>
        </div>
      </div>
    </div>
  );
}
