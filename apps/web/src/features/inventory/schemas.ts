import { z } from 'zod';

export const createTransferSchema = z.object({
  fromLocationId: z.string().min(1, 'Source warehouse is required'),
  toLocationId: z.string().min(1, 'Destination warehouse is required'),
  expectedDate: z.string().min(1, 'Expected date is required'),
  reason: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be greater than zero'),
  })).min(1, 'At least one item is required to transfer'),
}).refine(data => data.fromLocationId !== data.toLocationId, {
  message: "Source and destination warehouses cannot be the same",
  path: ["toLocationId"],
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;


export const createAdjustmentSchema = z.object({
  stockId: z.string().optional(),
  quantityChange: z.coerce.number().int().refine((value) => value !== 0, 'Adjustment quantity cannot be zero'),
  reason: z.enum(['Damaged', 'Found', 'Expired', 'Written off', 'Stock count correction', 'Other']),
  notes: z.string().optional(),
});

export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>;
