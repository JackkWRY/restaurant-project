/**
 * @file Table Validation Schemas
 * @description Zod validation schemas for table operations
 * 
 * This file provides:
 * - Table creation validation
 * - Table update validation
 * - Availability toggle validation
 * - Call staff status validation
 * 
 * Validation rules:
 * - name: Required, max 50 chars
 * - isAvailable: Boolean
 * - isCalling: Boolean
 * 
 * @module schemas/tableSchema
 * @requires zod
 * @see {@link ../controllers/tableController.ts} for usage
 */

import { z } from 'zod';

/**
 * Table Creation Schema
 * 
 * Validates table name for creation.
 * 
 * @example
 * const tableData = createTableSchema.parse({
 *   name: "A1"
 * });
 */
export const createTableSchema = z.object({
  name: z.string().min(1, "Table name is required").max(50, "Name is too long")
});

/**
 * Table Update Schema
 * 
 * Same validation as creation.
 */
export const updateTableSchema = createTableSchema;

/**
 * Toggle Availability Schema
 * 
 * Validates table availability status.
 */
export const toggleAvailabilitySchema = z.object({
  isAvailable: z.boolean()
});

/**
 * Update Call Staff Schema
 * 
 * Validates call staff button status.
 */
export const updateCallStaffSchema = z.object({
  isCalling: z.boolean()
});