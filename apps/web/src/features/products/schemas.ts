import { z } from 'zod';

export const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name required'),
  barcode: z.string().optional(),
  cost: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  reorderLevel: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  type: z.enum(['Finished good', 'Raw material', 'Service', 'Bundle']),
  categoryId: z.string().min(1, 'Category is required'),
  vendorId: z.string().optional(),
  brandId: z.string().optional(),
  description: z.string().max(2000).optional(),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  barcode: z.string().optional(),
  status: z.enum(['Draft', 'Active', 'Archived']).default('Draft'),
  
  images: z.array(z.string()).max(8, 'Maximum 8 images allowed').optional(),

  cost: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().min(0).default(0),
  wholesalePrice: z.coerce.number().min(0).optional(),
  taxClassId: z.string().optional(),
  priceIncludesTax: z.boolean().default(true),

  hasVariants: z.boolean().default(false),
  variants: z.array(productVariantSchema).optional(),

  trackInventory: z.boolean().default(true),
  reorderLevel: z.coerce.number().min(0).default(0),
  reorderQuantity: z.coerce.number().min(0).default(0),
  allowBackorder: z.boolean().default(false),

  isCommissionable: z.boolean().default(false),
}).refine(data => {
  if (data.type !== 'Raw material' && data.sellingPrice < data.cost) {
    return false; // Simplistic check, ideally handled with a warning rather than strict error in some systems
  }
  return true;
}, {
  message: "Selling price should not be below cost",
  path: ["sellingPrice"]
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
