import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  lga: z.string().min(1, 'LGA is required'),
  landmark: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const createCustomerSchema = z.object({
  userId: z.coerce.number().int().positive('A valid user ID is required'),
  referralCode: z.string().trim().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
