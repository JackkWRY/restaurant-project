import { z } from 'zod';
import { OrderStatus } from '../config/enums.js';

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];

export const createOrderSchema = z.object({
  tableId: z.number().int().positive(),
  items: z.array(
    z.object({
      menuId: z.number().int().positive(),
      quantity: z.number().int().positive("Quantity must be at least 1"),
      note: z.string().optional()
    })
  ).min(1, "Order must have at least 1 item")
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues)
});

export const updateOrderItemStatusSchema = z.object({
  status: z.enum(orderStatusValues)
});