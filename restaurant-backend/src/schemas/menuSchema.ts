/**
 * @file Menu Validation Schemas
 * @description Zod validation schemas for menu-related operations
 * 
 * This file provides:
 * - Menu creation validation
 * - Menu update validation (partial)
 * - Field-level validation rules
 * - Type coercion for numbers and booleans
 * 
 * Validation rules:
 * - nameTH: Required, 1-100 chars
 * - nameEN: Optional, max 100 chars
 * - price: Required, positive number, max 999999
 * - categoryId: Required, positive integer
 * - description: Optional, max 500 chars
 * - imageUrl: Optional, valid URL or empty string
 * - isRecommended/isAvailable/isVisible: Optional booleans
 * 
 * @module schemas/menuSchema
 * @requires zod
 * @see {@link ../controllers/menuController.ts} for usage
 * @see {@link ../middlewares/validateRequest.ts} for validation middleware
 */

import { z } from 'zod';

/**
 * String to Boolean Preprocessor
 * 
 * Converts string 'true'/'false' to boolean for form data compatibility.
 */
const stringToBoolean = z.preprocess((val) => {
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return val;
}, z.boolean().optional());

/**
 * Menu Creation Schema
 * 
 * Validates all required fields for creating a new menu item.
 * 
 * @example
 * const menuData = createMenuSchema.parse({
 *   nameTH: "ข้าวผัด",
 *   nameEN: "Fried Rice",
 *   price: 50,
 *   categoryId: 1,
 *   isAvailable: true
 * });
 */
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

/**
 * Menu Update Schema
 * 
 * Allows partial updates - all fields optional.
 * 
 * @example
 * const updates = updateMenuSchema.parse({
 *   price: 60,
 *   isAvailable: false
 * });
 */
export const updateMenuSchema = createMenuSchema.partial();