/**
 * @file Setting Validation Schemas
 * @description Zod validation schemas for application settings
 * 
 * This file provides:
 * - Restaurant name update validation
 * 
 * Validation rules:
 * - name: Required, non-empty string
 * 
 * @module schemas/settingSchema
 * @requires zod
 * @see {@link ../controllers/settingController.ts} for usage
 */

import { z } from 'zod';

/**
 * Update Setting Schema
 * 
 * Validates restaurant name update.
 * 
 * @example
 * const settingData = updateSettingSchema.parse({
 *   name: "ร้านอาหารไทย"
 * });
 */
export const updateSettingSchema = z.object({
  name: z.string().min(1, "Restaurant name cannot be empty")
});