import * as z from 'zod';

export const qualificationTriggerOptions = [
  { value: 'order_paid', label: 'Order Paid' },
  { value: 'order_delivered', label: 'Order Delivered' },
  { value: 'first_order_only', label: 'First Order Only' },
] as const;

export const approvalModeOptions = [
  { value: 'auto', label: 'Auto Approval' },
  { value: 'manual', label: 'Manual Approval' },
] as const;

export const networkLevelSchema = z
  .object({
    level: z.number().min(1),
    systemRate: z
      .number({ message: 'System commission rate is required' })
      .min(0.1, 'System commission rate must be greater than 0%')
      .max(100, 'System rate cannot exceed 100%'),
    rate: z
      .number({ message: 'Merchant/marketer rate is required' })
      .min(0, 'Merchant/marketer rate must be 0 or higher')
      .max(100, 'Rate cannot exceed 100%'),
    effectiveFrom: z.string().optional(),
    effectiveTo: z.string().optional(),
    qualificationTrigger: z.enum(['order_paid', 'order_delivered', 'first_order_only']),
    minOrderValue: z
      .number()
      .min(0, 'Minimum order value cannot be negative')
      .optional()
      .nullable(),
    approvalMode: z.enum(['auto', 'manual']).optional(),
    payoutDelay: z
      .number()
      .min(0, 'Payout delay cannot be negative')
      .optional()
      .nullable(),
  })
  .refine((lvl) => lvl.systemRate + lvl.rate <= 100, {
    message: 'System % + Merchant % cannot exceed 100%',
    path: ['rate'],
  });

export type NetworkLevelConfig = z.infer<typeof networkLevelSchema>;

export const commissionPlanFormSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  isActive: z.boolean(),

  // Commission Calculation Base Configuration
  calculationBaseType: z.enum(['pool_percentage', 'whole_order']),
  poolPercentage: z
    .number()
    .min(0.1, 'Pool percentage must be greater than 0%')
    .max(100, 'Pool percentage cannot exceed 100%')
    .optional()
    .nullable(),
  includeShipping: z.boolean(),
  includeTax: z.boolean(),

  // Dynamic Network Levels
  networkLevels: z.array(networkLevelSchema).min(1, 'At least one network level is required'),
});

export type CommissionPlanFormValues = z.infer<typeof commissionPlanFormSchema>;
