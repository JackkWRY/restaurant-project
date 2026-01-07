/**
 * @file Menu DTO Tests
 * @description Unit tests for Menu and Category DTOs
 * 
 * Tests cover:
 * - MenuDto transformation from Prisma
 * - CategoryDto transformation from Prisma
 * - Field mapping and type conversion
 * - Null/undefined handling
 * - Circular reference prevention
 * - Array transformations
 * 
 * Best Practices:
 * - Test data transformation
 * - Test type conversions (Decimal to number)
 * - Test optional fields
 * - Test nested relations
 */

import { describe, it, expect } from 'vitest';
import { MenuDto, CategoryDto } from '@/business/dtos/menuDto';
import { createMockMenu, createMockCategory } from '@/__tests__/helpers/testData';
import { Decimal } from '@prisma/client/runtime/library';

describe('MenuDto', () => {
  describe('fromPrisma', () => {
    it('should transform Prisma Menu to MenuDto', () => {
      // Arrange
      const mockMenu = createMockMenu({
        id: 1,
        nameTH: 'ข้าวผัด',
        nameEN: 'Fried Rice',
        price: new Decimal(50),
        categoryId: 1,
      });

      // Act
      const result = MenuDto.fromPrisma(mockMenu);

      // Assert
      expect(result).toBeInstanceOf(MenuDto);
      expect(result.id).toBe(1);
      expect(result.nameTH).toBe('ข้าวผัด');
      expect(result.nameEN).toBe('Fried Rice');
      expect(result.price).toBe(50);
      expect(result.categoryId).toBe(1);
    });

    it('should convert Decimal price to number', () => {
      // Arrange
      const mockMenu = createMockMenu({
        price: new Decimal(99.99),
      });

      // Act
      const result = MenuDto.fromPrisma(mockMenu);

      // Assert
      expect(typeof result.price).toBe('number');
      expect(result.price).toBe(99.99);
    });

    it('should handle null description as empty string', () => {
      // Arrange
      const mockMenu = createMockMenu({
        description: null as any,
      });

      // Act
      const result = MenuDto.fromPrisma(mockMenu);

      // Assert
      expect(result.description).toBe('');
    });

    it('should handle null imageUrl as empty string', () => {
      // Arrange
      const mockMenu = createMockMenu({
        imageUrl: null as any,
      });

      // Act
      const result = MenuDto.fromPrisma(mockMenu);

      // Assert
      expect(result.imageUrl).toBe('');
    });

    it('should include category when present', () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1, name: 'Main Dishes' });
      const mockMenu = {
        ...createMockMenu({ id: 1, categoryId: 1 }),
        category: mockCategory,
      };

      // Act
      const result = MenuDto.fromPrisma(mockMenu);

      // Assert
      expect(result.category).toBeDefined();
      expect(result.category).toBeInstanceOf(CategoryDto);
      expect(result.category?.id).toBe(1);
      expect(result.category?.name).toBe('Main Dishes');
    });

    it('should not include category when not present', () => {
      // Arrange
      const mockMenu = { ...createMockMenu({ id: 1 }), category: undefined };

      // Act
      const result = MenuDto.fromPrisma(mockMenu);

      // Assert
      expect(result.category).toBeUndefined();
    });

    it('should include all boolean flags', () => {
      // Arrange
      const mockMenu = createMockMenu({
        isRecommended: true,
        isAvailable: false,
        isVisible: true,
      });

      // Act
      const result = MenuDto.fromPrisma(mockMenu);

      // Assert
      expect(result.isRecommended).toBe(true);
      expect(result.isAvailable).toBe(false);
      expect(result.isVisible).toBe(true);
    });
  });

  describe('fromPrismaMany', () => {
    it('should transform array of Prisma Menus to MenuDtos', () => {
      // Arrange
      const mockMenus = [
        createMockMenu({ id: 1, nameTH: 'Menu 1' }),
        createMockMenu({ id: 2, nameTH: 'Menu 2' }),
        createMockMenu({ id: 3, nameTH: 'Menu 3' }),
      ];

      // Act
      const result = MenuDto.fromPrismaMany(mockMenus);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(MenuDto);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should handle empty array', () => {
      // Arrange
      const mockMenus: any[] = [];

      // Act
      const result = MenuDto.fromPrismaMany(mockMenus);

      // Assert
      expect(result).toEqual([]);
    });
  });
});

describe('CategoryDto', () => {
  describe('fromPrisma', () => {
    it('should transform Prisma Category to CategoryDto', () => {
      // Arrange
      const mockCategory = createMockCategory({
        id: 1,
        name: 'Appetizers',
      });

      // Act
      const result = CategoryDto.fromPrisma(mockCategory);

      // Assert
      expect(result).toBeInstanceOf(CategoryDto);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Appetizers');
    });

    it('should include menus when present', () => {
      // Arrange
      const mockMenus = [
        createMockMenu({ id: 1, nameTH: 'Menu 1', price: new Decimal(50) }),
        createMockMenu({ id: 2, nameTH: 'Menu 2', price: new Decimal(60) }),
      ];

      const mockCategory = {
        ...createMockCategory({ id: 1, name: 'Main Dishes' }),
        menus: mockMenus,
      };

      // Act
      const result = CategoryDto.fromPrisma(mockCategory);

      // Assert
      expect(result.menus).toBeDefined();
      expect(result.menus).toHaveLength(2);
      expect(result.menus![0].id).toBe(1);
      expect(result.menus![0].nameTH).toBe('Menu 1');
      expect(result.menus![0].price).toBe(50);
    });

    it('should not include menus when not present', () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1 });

      // Act
      const result = CategoryDto.fromPrisma(mockCategory);

      // Assert
      expect(result.menus).toBeUndefined();
    });

    it('should prevent circular reference in nested menus', () => {
      // Arrange
      const mockMenus = [
        createMockMenu({ id: 1, categoryId: 1 }),
      ];

      const mockCategory = {
        ...createMockCategory({ id: 1 }),
        menus: mockMenus,
      };

      // Act
      const result = CategoryDto.fromPrisma(mockCategory);

      // Assert
      expect(result.menus).toBeDefined();
      expect(result.menus![0]).not.toHaveProperty('category');
    });

    it('should convert Decimal prices in nested menus', () => {
      // Arrange
      const mockMenus = [
        createMockMenu({ id: 1, price: new Decimal(75.50) }),
      ];

      const mockCategory = {
        ...createMockCategory({ id: 1 }),
        menus: mockMenus,
      };

      // Act
      const result = CategoryDto.fromPrisma(mockCategory);

      // Assert
      expect(typeof result.menus![0].price).toBe('number');
      expect(result.menus![0].price).toBe(75.50);
    });
  });

  describe('fromPrismaMany', () => {
    it('should transform array of Prisma Categories to CategoryDtos', () => {
      // Arrange
      const mockCategories = [
        createMockCategory({ id: 1, name: 'Category 1' }),
        createMockCategory({ id: 2, name: 'Category 2' }),
      ];

      // Act
      const result = CategoryDto.fromPrismaMany(mockCategories);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CategoryDto);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should handle empty array', () => {
      // Arrange
      const mockCategories: any[] = [];

      // Act
      const result = CategoryDto.fromPrismaMany(mockCategories);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
