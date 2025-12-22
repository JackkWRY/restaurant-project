import { z } from 'zod';

export const createMenuSchema = z.object({
  nameTH: z.string().min(1, "Thai name is required"),
  nameEN: z.string().optional(),
  
  price: z.coerce.number().min(0, "Price cannot be negative"),
  
  categoryId: z.coerce.number().int().positive("Category ID must be valid"),
  
  description: z.string().optional(),
  
  imageUrl: z.union([
    z.string().url({ message: "Invalid image URL" }),
    z.literal("")
  ]).optional(),
  
  isRecommended: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isVisible: z.boolean().optional()
});

export const updateMenuSchema = createMenuSchema.partial();