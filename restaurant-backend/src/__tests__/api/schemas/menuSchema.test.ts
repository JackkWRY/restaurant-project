/**
 * @file Menu Schema Tests
 * @description Unit tests for menu Zod validation schemas
 * 
 * Tests cover:
 * - createMenuSchema - validation rules for menu creation
 * - updateMenuSchema - partial validation for updates
 * 
 * Best Practices:
 * - Test valid data passes
 * - Test invalid data fails with correct errors
 * - Test edge cases and boundaries
 * - Test type coercion
 */

import { describe, it, expect } from 'vitest';
import { createMenuSchema, updateMenuSchema } from '../../../api/schemas/menuSchema.js';

describe('MenuSchema', () => {
  describe('createMenuSchema', () => {
    it('should validate valid menu data', () => {
      // Arrange
      const validData = {
        nameTH: 'ข้าวผัด',
        nameEN: 'Fried Rice',
        price: 50,
        categoryId: 1,
        description: 'Delicious fried rice',
        imageUrl: 'https://example.com/image.jpg',
        isRecommended: true,
        isAvailable: true,
        isVisible: true
      };

      // Act
      const result = createMenuSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should require nameTH field', () => {
      // Arrange
      const invalidData = {
        price: 50,
        categoryId: 1
      };

      // Act
      const result = createMenuSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('nameTH');
      }
    });

    it('should reject nameTH longer than 100 characters', () => {
      // Arrange
      const invalidData = {
        nameTH: 'a'.repeat(101),
        price: 50,
        categoryId: 1
      };

      // Act
      const result = createMenuSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 100 characters');
      }
    });

    it('should require positive price', () => {
      // Arrange
      const invalidData = {
        nameTH: 'ข้าวผัด',
        price: -10,
        categoryId: 1
      };

      // Act
      const result = createMenuSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('greater than 0');
      }
    });

    it('should coerce string price to number', () => {
      // Arrange
      const dataWithStringPrice = {
        nameTH: 'ข้าวผัด',
        price: '50',
        categoryId: 1
      };

      // Act
      const result = createMenuSchema.safeParse(dataWithStringPrice);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.price).toBe('number');
        expect(result.data.price).toBe(50);
      }
    });

    it('should validate imageUrl as URL or empty string', () => {
      // Arrange
      const validWithUrl = {
        nameTH: 'ข้าวผัด',
        price: 50,
        categoryId: 1,
        imageUrl: 'https://example.com/image.jpg'
      };

      const validWithEmpty = {
        nameTH: 'ข้าวผัด',
        price: 50,
        categoryId: 1,
        imageUrl: ''
      };

      // Act & Assert
      expect(createMenuSchema.safeParse(validWithUrl).success).toBe(true);
      expect(createMenuSchema.safeParse(validWithEmpty).success).toBe(true);
    });

    it('should reject invalid imageUrl', () => {
      // Arrange
      const invalidData = {
        nameTH: 'ข้าวผัด',
        price: 50,
        categoryId: 1,
        imageUrl: 'not-a-url'
      };

      // Act
      const result = createMenuSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should convert string boolean to boolean', () => {
      // Arrange
      const dataWithStringBoolean = {
        nameTH: 'ข้าวผัด',
        price: 50,
        categoryId: 1,
        isAvailable: 'true',
        isRecommended: 'false'
      };

      // Act
      const result = createMenuSchema.safeParse(dataWithStringBoolean);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isAvailable).toBe(true);
        expect(result.data.isRecommended).toBe(false);
      }
    });
  });

  describe('updateMenuSchema', () => {
    it('should allow partial updates', () => {
      // Arrange
      const partialData = {
        price: 60
      };

      // Act
      const result = updateMenuSchema.safeParse(partialData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should validate fields when provided', () => {
      // Arrange
      const invalidPartial = {
        price: -10
      };

      // Act
      const result = updateMenuSchema.safeParse(invalidPartial);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should allow empty object', () => {
      // Arrange
      const emptyData = {};

      // Act
      const result = updateMenuSchema.safeParse(emptyData);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
