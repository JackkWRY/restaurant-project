/**
 * @file Bill Schema Tests
 * @description Unit tests for bill Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import { checkoutSchema } from '../../../api/schemas/billSchema.js';

describe('BillSchema', () => {
  describe('checkoutSchema', () => {
    it('should validate valid checkout data', () => {
      const result = checkoutSchema.safeParse({
        tableId: 5,
        paymentMethod: 'CASH'
      });
      expect(result.success).toBe(true);
    });

    it('should require tableId', () => {
      const result = checkoutSchema.safeParse({
        paymentMethod: 'CASH'
      });
      expect(result.success).toBe(false);
    });

    it('should coerce string tableId to number', () => {
      const result = checkoutSchema.safeParse({
        tableId: '5',
        paymentMethod: 'CASH'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.tableId).toBe('number');
      }
    });

    it('should default paymentMethod to CASH', () => {
      const result = checkoutSchema.safeParse({
        tableId: 5
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentMethod).toBe('CASH');
      }
    });

    it('should reject negative tableId', () => {
      const result = checkoutSchema.safeParse({
        tableId: -1,
        paymentMethod: 'CASH'
      });
      expect(result.success).toBe(false);
    });
  });
});
