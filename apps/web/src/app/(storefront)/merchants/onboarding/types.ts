import { z } from 'zod';

export const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)[789][01]\d{8}$/;

export function normalizeNigerianPhone(value: string): string {
  return value.trim().replace(/[\s-]/g, '');
}

export const merchantOnboardingSchema = z
  .object({
    // Step 1: Business Registration
    businessName: z.string().trim().min(2, 'Business name must be at least 2 characters'),
    businessType: z.string().min(1, 'Business type is required'),
    isProvisional: z.boolean(),
    rcNumber: z.string().optional(),
    cacDocumentName: z.string().optional(),

    // Step 2: Owner Identity & NIN
    ownerName: z.string().trim().min(2, 'Owner or representative full name is required'),
    phone: z
      .string()
      .refine((val) => NIGERIAN_PHONE_REGEX.test(normalizeNigerianPhone(val)), {
        message: 'Enter a valid Nigerian phone number (e.g. 08031234567 or +2348031234567)',
      }),
    email: z.string().trim().email('Valid business email address is required'),
    idType: z.string().min(1, 'Identity document type is required'),
    ninNumber: z.string().trim().regex(/^\d{11}$/, 'NIN / ID number must be exactly 11 digits'),
    idDocumentName: z.string().min(1, 'Please upload your identification document'),

    // Step 3: Location & Settlement
    address: z.string().trim().min(5, 'Physical workshop / store address is required'),
    marketCluster: z.string().min(1, 'Market hub or cluster is required'),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    bankName: z.string().min(2, 'Settlement bank name is required'),
    accountNumber: z.string().trim().regex(/^\d{10}$/, 'Account number must be exactly 10 digits'),

    // Step 4: Product Information
    productDescription: z.string().trim().min(10, 'Please describe primary products sold (min 10 characters)'),
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
  })
  .superRefine((data, ctx) => {
    if (!data.isProvisional) {
      if (!data.rcNumber || data.rcNumber.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rcNumber'],
          message: 'CAC RC or BN number is required for registered businesses',
        });
      }
      if (!data.cacDocumentName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cacDocumentName'],
          message: 'Please upload your CAC certificate or status report',
        });
      }
    }

    const hasRegulatoryCert = data.certificationTypes.some(
      (cert) => cert !== 'None / Artisanal Guild',
    );
    if (hasRegulatoryCert) {
      if (!data.certificationNumber || data.certificationNumber.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['certificationNumber'],
          message: 'Certification / registration number is required',
        });
      }
      if (!data.certificationDocumentName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['certificationDocumentName'],
          message: 'Please upload your regulatory certificate document',
        });
      }
    }
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
