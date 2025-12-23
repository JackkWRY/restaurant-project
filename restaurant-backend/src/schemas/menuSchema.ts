import { z } from 'zod';

const stringToBoolean = z.preprocess((val) => {
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return val;
}, z.boolean().optional());

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
  
  isRecommended: stringToBoolean,
  isAvailable: stringToBoolean,
  isVisible: stringToBoolean
});

export const updateMenuSchema = createMenuSchema.partial();