/**
 * @file Bill Validation Schemas
 * @description Zod validation schemas for bill/checkout operations
 * 
 * This file provides:
 * - Checkout validation with payment method
 * 
 * Validation rules:
 * - tableId: Required, positive number (coerced)
 * - paymentMethod: Optional string, defaults to 'CASH'
 * 
 * @module schemas/billSchema
 * @requires zod
 * @see {@link ../controllers/billController.ts} for usage
 */

import { z } from 'zod';

/**
 * Checkout Schema
 * 
 * Validates table checkout with payment method.
 * 
 * @example
 * const checkoutData = checkoutSchema.parse({
 *   tableId: 5,
 *   paymentMethod: "CASH"
 * });
 */
export const checkoutSchema = z.object({
  tableId: z.coerce.number().positive("Table ID is required"),
  paymentMethod: z.string().optional().default('CASH')
});