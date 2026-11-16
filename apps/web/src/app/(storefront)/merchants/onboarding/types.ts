import { z } from 'zod';

export const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)[789][01]\d{8}$/;

export function normalizeNigerianPhone(value: string): string {
  return value.trim().replace(/[\s-]/g, '');
}

export const IDENTITY_DOCUMENT_TYPES = [
  'nin',
  'international_passport',
  'drivers_license',
  'voters_card',
] as const;

export type IdentityDocumentType = (typeof IDENTITY_DOCUMENT_TYPES)[number];

export const IDENTITY_DOCUMENT_NUMBER_DETAILS: Record<
  IdentityDocumentType,
  { label: string; inputLabel: string; placeholder: string; maxLength: number; description: string; pattern: RegExp }
> = {
  nin: {
    label: 'National Identity Number (NIN)',
    inputLabel: 'NIN Number',
    placeholder: 'e.g. 12345678901',
    maxLength: 11,
    description: 'Exactly 11 digits.',
    pattern: /^\d{11}$/,
  },
  international_passport: {
    label: 'International Passport',
    inputLabel: 'Passport Number',
    placeholder: 'e.g. A12345678',
    maxLength: 20,
    description: '6–20 letters and numbers.',
    pattern: /^[A-Z0-9]{6,20}$/i,
  },
  drivers_license: {
    label: "Driver's Licence",
    inputLabel: "Driver's Licence Number",
    placeholder: 'e.g. ABC-123456789',
    maxLength: 30,
    description: '6–30 letters, numbers, or hyphens.',
    pattern: /^[A-Z0-9-]{6,30}$/i,
  },
  voters_card: {
    label: "Voter's Card",
    inputLabel: 'Voter Identification Number (VIN)',
    placeholder: 'e.g. 90F5B7D11A2C3E4F567',
    maxLength: 19,
    description: 'Exactly 19 letters and numbers.',
    pattern: /^[A-Z0-9]{19}$/i,
  },
};

export const merchantOnboardingSchema = z
  .object({
    // Step 1: Business Registration
    businessName: z.string().trim().min(2, 'Business name must be at least 2 characters'),
    businessType: z.string().min(1, 'Business type is required'),
    isProvisional: z.boolean(),
    rcNumber: z.string().optional(),
    cacDocumentName: z.string().optional(),

    // Step 2: Owner Identity
    ownerName: z.string().trim().min(2, 'Owner or representative full name is required'),
    contactPhoneNumber: z
      .string()
      .refine((val) => NIGERIAN_PHONE_REGEX.test(normalizeNigerianPhone(val)), {
        message: 'Enter a valid Nigerian contact phone number (e.g. 08031234567 or +2348031234567)',
      }),
    whatsappPhoneNumber: z
      .string()
      .refine((val) => NIGERIAN_PHONE_REGEX.test(normalizeNigerianPhone(val)), {
        message: 'Enter a valid Nigerian WhatsApp number (e.g. 08031234567 or +2348031234567)',
      }),
    email: z.string().trim().email('Valid business email address is required'),
    idType: z.enum(IDENTITY_DOCUMENT_TYPES, { message: 'Identity document type is required' }),
    idNumber: z.string().trim().min(1, 'Identity document number is required'),
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

    const identityRule = IDENTITY_DOCUMENT_NUMBER_DETAILS[data.idType];
    if (!identityRule.pattern.test(data.idNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['idNumber'],
        message: `${identityRule.inputLabel} is invalid. ${identityRule.description}`,
      });
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
  { id: 'identity', title: 'Owner & Identity', description: 'Identity verification' },
  { id: 'location', title: 'Location & Settlement', description: 'Address and banking' },
  { id: 'products', title: 'Products & Quality', description: 'Catalog standards' },
  { id: 'certifications', title: 'Certifications & SLA', description: 'Regulatory & fulfillment' },
];
