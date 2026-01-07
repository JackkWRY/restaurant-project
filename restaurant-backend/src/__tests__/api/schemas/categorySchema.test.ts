/**
 * @file Category Schema Tests
 * @description Unit tests for category Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import { createCategorySchema, updateCategorySchema } from '../../../api/schemas/categorySchema.js';

describe('CategorySchema', () => {
  describe('createCategorySchema', () => {
    it('should validate valid category name', () => {
      const result = createCategorySchema.safeParse({ name: 'อาหารจานหลัก' });
      expect(result.success).toBe(true);
    });

    it('should require name field', () => {
      const result = createCategorySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 50 characters', () => {
      const result = createCategorySchema.safeParse({ name: 'a'.repeat(51) });
      expect(result.success).toBe(false);
    });

    it('should trim whitespace', () => {
      const result = createCategorySchema.safeParse({ name: '  Category  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Category');
      }
    });
  });

  describe('updateCategorySchema', () => {
    it('should validate same as create schema', () => {
      const result = updateCategorySchema.safeParse({ name: 'Updated' });
      expect(result.success).toBe(true);
    });
  });
});
