import { z } from 'zod';

const stringToBoolean = z.preprocess((val) => {
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return val;
}, z.boolean().optional());

export const createMenuSchema = z.object({
  nameTH: z.string()
    .min(1, "Thai name is required")
    .max(100, "Thai name must be less than 100 characters")
    .trim(),
  
  nameEN: z.string()
    .max(100, "English name must be less than 100 characters")
    .trim()
    .optional(),
  
  price: z.coerce.number()
    .positive("Price must be greater than 0")
    .max(999999, "Price is too high"),
  
  categoryId: z.coerce.number()
    .int("Category ID must be an integer")
    .positive("Category ID must be valid"),
  
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),
  
  imageUrl: z.union([
    z.string().url({ message: "Invalid image URL" }),
    z.literal("")
  ]).optional(),
  
  isRecommended: stringToBoolean,
  isAvailable: stringToBoolean,
  isVisible: stringToBoolean
});

export const updateMenuSchema = createMenuSchema.partial();