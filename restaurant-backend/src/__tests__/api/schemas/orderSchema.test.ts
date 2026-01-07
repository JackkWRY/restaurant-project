/**
 * @file Order Schema Tests
 * @description Unit tests for order Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import { createOrderSchema, updateOrderStatusSchema, updateOrderItemStatusSchema } from '../../../api/schemas/orderSchema.js';

describe('OrderSchema', () => {
  describe('createOrderSchema', () => {
    it('should validate valid order data', () => {
      const result = createOrderSchema.safeParse({
        tableId: 1,
        items: [
          { menuId: 5, quantity: 2, note: 'No spicy' },
          { menuId: 3, quantity: 1 }
        ]
      });
      expect(result.success).toBe(true);
    });

    it('should require tableId', () => {
      const result = createOrderSchema.safeParse({
        items: [{ menuId: 1, quantity: 1 }]
      });
      expect(result.success).toBe(false);
    });

    it('should require at least 1 item', () => {
      const result = createOrderSchema.safeParse({
        tableId: 1,
        items: []
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 50 items', () => {
      const items = Array(51).fill({ menuId: 1, quantity: 1 });
      const result = createOrderSchema.safeParse({
        tableId: 1,
        items
      });
      expect(result.success).toBe(false);
    });

    it('should validate quantity range', () => {
      const invalidQuantity = createOrderSchema.safeParse({
        tableId: 1,
        items: [{ menuId: 1, quantity: 100 }]
      });
      expect(invalidQuantity.success).toBe(false);

      const validQuantity = createOrderSchema.safeParse({
        tableId: 1,
        items: [{ menuId: 1, quantity: 50 }]
      });
      expect(validQuantity.success).toBe(true);
    });

    it('should validate note length', () => {
      const result = createOrderSchema.safeParse({
        tableId: 1,
        items: [{ menuId: 1, quantity: 1, note: 'a'.repeat(201) }]
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('should validate valid status', () => {
      const result = updateOrderStatusSchema.safeParse({ status: 'PENDING' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateOrderStatusSchema.safeParse({ status: 'INVALID_STATUS' });
      expect(result.success).toBe(false);
    });
  });

  describe('updateOrderItemStatusSchema', () => {
    it('should validate valid status', () => {
      const result = updateOrderItemStatusSchema.safeParse({ status: 'COMPLETED' });
      expect(result.success).toBe(true);
    });
  });
});
