import { z } from 'zod';

export const merchantOnboardingSchema = z.object({
  // Step 1: Business Registration
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(1, 'Business type is required'),
  isProvisional: z.boolean(),
  rcNumber: z.string().optional(),
  cacDocumentName: z.string().optional(),

  // Step 2: Owner Identity & NIN
  ownerName: z.string().min(2, 'Owner or representative full name is required'),
  phone: z.string().min(11, 'Valid phone number is required (min 11 digits)'),
  email: z.string().email('Valid business email address is required'),
  idType: z.string().min(1, 'Identity document type is required'),
  ninNumber: z.string().min(11, 'NIN / ID number must be at least 11 digits'),
  idDocumentName: z.string().optional(),

  // Step 3: Location & Settlement
  address: z.string().min(5, 'Physical workshop / store address is required'),
  marketCluster: z.string().min(1, 'Market hub or cluster is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  bankName: z.string().min(2, 'Settlement bank name is required'),
  accountNumber: z.string().length(10, 'Account number must be 10 digits'),

  // Step 4: Product Information
  productDescription: z.string().min(10, 'Please describe primary products sold (min 10 characters)'),
  capacity: z.string().min(2, 'Estimated monthly capacity is required'),
  samplePhotosCount: z.number().min(1, 'Please upload at least 1 sample product photo'),

  // Step 5: Certifications & Operational Verification
  certificationTypes: z.array(z.string()).min(1, 'Select at least one certification'),
  certificationNumber: z.string().optional(),
  certificationDocumentName: z.string().optional(),
  confirmSupplyCapacity: z.boolean().refine((val) => val === true, {
    message: 'You must confirm supply capacity',
  }),
  agreeToFulfillmentSla: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the 24-48hr fulfillment SLA',
  }),
});

export type MerchantOnboardingData = z.infer<typeof merchantOnboardingSchema>;

export interface StepItem {
  id: string;
  title: string;
  description: string;
}

export const ONBOARDING_STEPS: StepItem[] = [
  { id: 'business', title: 'Business & CAC', description: 'Registration details' },
  { id: 'identity', title: 'Owner & NIN', description: 'Identity verification' },
  { id: 'location', title: 'Location & Settlement', description: 'Address and banking' },
  { id: 'products', title: 'Products & Quality', description: 'Catalog standards' },
  { id: 'certifications', title: 'Certifications & SLA', description: 'Regulatory & fulfillment' },
];
