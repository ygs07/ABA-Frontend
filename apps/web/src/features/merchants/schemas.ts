import { z } from 'zod';

export const createMerchantSchema = z.object({
  userId: z.number().int().positive().optional(),
  userFirstName: z.string().min(2, 'First name is required'),
  userLastName: z.string().min(2, 'Last name is required'),
  userUsername: z.string().min(3, 'Username must be at least 3 characters'),
  userPassword: z.string().min(8, 'Password must be at least 8 characters'),
  // Business
  name: z.string().min(2, 'Name must be at least 2 characters'),
  legalName: z.string().min(2, 'Legal name is required'),
  type: z.enum(['Own outlet', 'Franchise', 'Partner']),
  rcNumber: z.string().optional(),
  category: z.string().optional(),
  
  // Contact
  ownerName: z.string().min(2, 'Owner name is required'),
  phone: z.string().regex(/^\+?234\d{10}$/, 'Must be a valid Nigerian phone number starting with +234 or 234'),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  
  // Location
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  lga: z.string().optional(),
  // Branding & Media
  logoUrl: z.string().optional(),
  bannerImage: z.string().optional(),
});

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;
