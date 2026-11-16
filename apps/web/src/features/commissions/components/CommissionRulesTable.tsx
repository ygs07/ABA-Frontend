'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Percent,
  Layers,
  Truck,
  Receipt,
  Calendar,
  ShieldCheck,
  Clock,
  SlidersHorizontal,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store';
import {
  CommissionPlanFormValues,
  approvalModeOptions,
  qualificationTriggerOptions,
} from '../schemas';

const DUMMY_COMMISSION_PLAN: CommissionPlanFormValues = {
  name: 'Standard Multi-Tier Affiliate Plan',
  description:
    'Platform-wide commission configuration governing referral pool allocation, order adjustments, and multi-level upline rewards.',
  isActive: true,
  calculationBaseType: 'pool_percentage',
  poolPercentage: 10,
  includeShipping: false,
  includeTax: false,
  networkLevels: [
    {
      level: 1,
      systemRate: 2,
      rate: 5,
      effectiveFrom: '',
      effectiveTo: '',
      qualificationTrigger: 'order_paid',
      minOrderValue: 5000,
      approvalMode: 'auto',
      payoutDelay: 7,
    },
    {
      level: 2,
      systemRate: 2,
      rate: 3,
      effectiveFrom: '2026-01-01',
      effectiveTo: '',
      qualificationTrigger: 'order_delivered',
      minOrderValue: 10000,
      approvalMode: 'auto',
      payoutDelay: 14,
    },
    {
      level: 3,
      systemRate: 1.5,
      rate: 2,
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      qualificationTrigger: 'first_order_only',
      minOrderValue: null,
      approvalMode: 'manual',
      payoutDelay: 21,
    },
  ],
};

function getTriggerLabel(value: string): string {
  return qualificationTriggerOptions.find((opt) => opt.value === value)?.label ?? value;
}

function getApprovalLabel(value?: string): string {
  return approvalModeOptions.find((opt) => opt.value === value)?.label ?? 'Auto Approval';
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'No minimum';
  return `₦${value.toLocaleString('en-NG')}`;
}

export function CommissionRulesTable() {
  const userType = useAuthStore((state) => state.user?.userType ?? state.activeRole);
  const canManageRules = userType === 'Admin' || userType === 'Super Admin';
  const [isActive, setIsActive] = useState(DUMMY_COMMISSION_PLAN.isActive);

  const plan = DUMMY_COMMISSION_PLAN;

  const handleToggleStatus = () => {
    const next = !isActive;
    setIsActive(next);
    toast.success(`Commission plan ${next ? 'activated' : 'deactivated'} (UI preview)`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* General Settings Overview */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-text">{plan.name}</h2>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {plan.description && (
                <p className="text-sm text-text-muted max-w-2xl">{plan.description}</p>
              )}
            </div>

            {canManageRules && (
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                  {isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Link href="/erp/commissions/rules/new">
                  <Button size="sm">
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Update Configuration
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="rounded-lg border border-border bg-surface-1 p-3.5">
              <p className="text-xs text-text-muted">Configured Levels</p>
              <p className="text-lg font-bold text-text mt-0.5">{plan.networkLevels.length} Levels</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-1 p-3.5">
              <p className="text-xs text-text-muted">System Retained (All Levels)</p>
              <p className="text-lg font-bold text-text mt-0.5">
                {plan.networkLevels.reduce((sum, lvl) => sum + lvl.systemRate, 0)}%
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-1 p-3.5">
              <p className="text-xs text-text-muted">Merchant Allocated (All Levels)</p>
              <p className="text-lg font-bold text-text mt-0.5">
                {plan.networkLevels.reduce((sum, lvl) => sum + lvl.rate, 0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Calculation Base Overview */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-6 space-y-4">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-base text-text">Commission Calculation Base</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-surface-1 p-4 space-y-1">
              <p className="text-xs text-text-muted flex items-center gap-1.5">
                {plan.calculationBaseType === 'pool_percentage' ? (
                  <Percent className="w-3.5 h-3.5 text-brand-600" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-brand-600" />
                )}
                Transaction Base Method
              </p>
              <p className="text-sm font-semibold text-text">
                {plan.calculationBaseType === 'pool_percentage'
                  ? `Defined Pool (${plan.poolPercentage ?? 0}% of order)`
                  : 'Whole Order Amount (100%)'}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-4 space-y-1">
              <p className="text-xs text-text-muted flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-600" />
                Include Shipping
              </p>
              <p className="text-sm font-semibold text-text">
                {plan.includeShipping ? 'Included' : 'Excluded'}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-4 space-y-1">
              <p className="text-xs text-text-muted flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-600" />
                Include Tax
              </p>
              <p className="text-sm font-semibold text-text">
                {plan.includeTax ? 'Included' : 'Excluded'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Engine & Rules - Per Level */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-6 space-y-5">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-base text-text">Calculation Engine &amp; Rules</h3>
            <p className="text-xs text-text-muted mt-1">
              Active per-level rates, qualification triggers, date windows, and payout rules.
            </p>
          </div>

          <div className="space-y-4">
            {plan.networkLevels.map((lvl) => (
              <div
                key={lvl.level}
                className="rounded-xl border border-border bg-surface-1 p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {lvl.level}
                    </span>
                    <div>
                      <h4 className="font-bold text-text text-sm">Network Level {lvl.level}</h4>
                      <p className="text-xs text-text-muted">
                        {lvl.level === 1
                          ? 'Direct referrer earning rule'
                          : `Tier ${lvl.level} indirect upline earning rule`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">System: {lvl.systemRate}%</Badge>
                    <Badge variant="default">Merchant: {lvl.rate}%</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                      Qualification Trigger
                    </p>
                    <p className="font-medium text-text mt-0.5">
                      {getTriggerLabel(lvl.qualificationTrigger)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      Effective From
                    </p>
                    <p className="font-medium text-text mt-0.5">
                      {lvl.effectiveFrom || 'Beginning of plan'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      Effective To
                    </p>
                    <p className="font-medium text-text mt-0.5">
                      {lvl.effectiveTo || 'End of plan'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted">Minimum Order Value</p>
                    <p className="font-medium text-text mt-0.5">
                      {formatCurrency(lvl.minOrderValue)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted">Approval Mode</p>
                    <p className="font-medium text-text mt-0.5">
                      {getApprovalLabel(lvl.approvalMode)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      Payout Delay
                    </p>
                    <p className="font-medium text-text mt-0.5">
                      {lvl.payoutDelay ?? 0} days
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
