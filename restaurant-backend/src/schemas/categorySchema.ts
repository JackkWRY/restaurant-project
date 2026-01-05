/**
 * @file Category Validation Schemas
 * @description Zod validation schemas for category operations
 * 
 * This file provides:
 * - Category creation validation
 * - Category update validation
 * 
 * Validation rules:
 * - name: Required, 1-50 chars, trimmed
 * 
 * @module schemas/categorySchema
 * @requires zod
 * @see {@link ../controllers/categoryController.ts} for usage
 */

import { z } from 'zod';

/**
 * Category Creation Schema
 * 
 * Validates category name for creation.
 * 
 * @example
 * const categoryData = createCategorySchema.parse({
 *   name: "อาหารจานหลัก"
 * });
 */
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters")
    .trim()
});

/**
 * Category Update Schema
 * 
 * Same validation as creation.
 */
export const updateCategorySchema = createCategorySchema;