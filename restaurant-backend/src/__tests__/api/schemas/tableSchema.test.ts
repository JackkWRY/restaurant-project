/**
 * @file Table Schema Tests
 * @description Unit tests for table Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import { createTableSchema, updateTableSchema, toggleAvailabilitySchema, updateCallStaffSchema } from '../../../api/schemas/tableSchema.js';

describe('TableSchema', () => {
  describe('createTableSchema', () => {
    it('should validate valid table name', () => {
      const result = createTableSchema.safeParse({ name: 'A1' });
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const result = createTableSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 50 characters', () => {
      const result = createTableSchema.safeParse({ name: 'a'.repeat(51) });
      expect(result.success).toBe(false);
    });
  });

  describe('updateTableSchema', () => {
    it('should validate same as create', () => {
      const result = updateTableSchema.safeParse({ name: 'B2' });
      expect(result.success).toBe(true);
    });
  });

  describe('toggleAvailabilitySchema', () => {
    it('should validate boolean isAvailable', () => {
      const resultTrue = toggleAvailabilitySchema.safeParse({ isAvailable: true });
      const resultFalse = toggleAvailabilitySchema.safeParse({ isAvailable: false });
      expect(resultTrue.success).toBe(true);
      expect(resultFalse.success).toBe(true);
    });

    it('should reject non-boolean', () => {
      const result = toggleAvailabilitySchema.safeParse({ isAvailable: 'true' });
      expect(result.success).toBe(false);
    });
  });

  describe('updateCallStaffSchema', () => {
    it('should validate boolean isCalling', () => {
      const result = updateCallStaffSchema.safeParse({ isCalling: true });
      expect(result.success).toBe(true);
    });
  });
});
