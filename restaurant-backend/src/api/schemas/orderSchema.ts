/**
 * @file Order Validation Schemas
 * @description Zod validation schemas for order-related operations
 * 
 * This file provides:
 * - Order creation validation with items array
 * - Order status update validation
 * - Order item status update validation
 * - Enum-based status validation
 * 
 * Validation rules:
 * - tableId: Required, positive integer
 * - items: Array of 1-50 items
 * - menuId: Required per item, positive integer
 * - quantity: Required per item, 1-99
 * - note: Optional per item, max 200 chars
 * - status: Must be valid OrderStatus enum value
 * 
 * @module schemas/orderSchema
 * @requires zod
 * @requires config/enums
 * @see {@link ../controllers/orderController.ts} for usage
 */

import { z } from 'zod';
import { OrderStatus } from '../../core/config/enums.js';

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];

/**
 * Order Creation Schema
 * 
 * Validates order with table ID and items array.
 * 
 * @example
 * const orderData = createOrderSchema.parse({
 *   tableId: 1,
 *   items: [
 *     { menuId: 5, quantity: 2, note: "No spicy" },
 *     { menuId: 3, quantity: 1 }
 *   ]
 * });
 */
export const createOrderSchema = z.object({
  tableId: z.number().int().positive("Table ID must be valid"),
  items: z.array(
    z.object({
      menuId: z.number().int().positive("Menu ID must be valid"),
      quantity: z.number()
        .int("Quantity must be an integer")
        .positive("Quantity must be at least 1")
        .max(99, "Quantity cannot exceed 99"),
      note: z.string()
        .max(200, "Note must be less than 200 characters")
        .trim()
        .optional()
    })
  )
  .min(1, "Order must have at least 1 item")
  .max(50, "Order cannot have more than 50 items")
});

/**
 * Order Status Update Schema
 * 
 * Validates status transitions for entire order.
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues)
});

/**
 * Order Item Status Update Schema
 * 
 * Validates status transitions for individual items.
 */
export const updateOrderItemStatusSchema = z.object({
  status: z.enum(orderStatusValues)
});