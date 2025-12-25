import { z } from 'zod';
import { OrderStatus } from '../config/enums.js';

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];

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

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues)
});

export const updateOrderItemStatusSchema = z.object({
  status: z.enum(orderStatusValues)
});