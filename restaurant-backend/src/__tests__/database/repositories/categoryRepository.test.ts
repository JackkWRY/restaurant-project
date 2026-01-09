/**
 * @file Category Repository Tests
 * @description Unit tests for category data access layer
 * 
 * Tests cover:
 * - findAll() with/without menus
 * - findById() with/without menus
 * - findByName() name lookup
 * - hasMenus() check for related menus
 * - create() category creation
 * - update() category updates
 * - delete() category deletion
 * 
 * Best Practices:
 * - Mock Prisma client
 * - Test method calls
 * - Test query parameters
 * - Test return values
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { categoryRepository } from '@/database/repositories/categoryRepository';
import prisma from '@/database/client/prisma';
import { createMockCategory } from '@/__tests__/helpers/testData';

// Mock Prisma client
vi.mock('@/database/client/prisma', () => ({
  default: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    menu: {
      count: vi.fn(),
    },
  },
}));

describe('CategoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all categories without menus', async () => {
      // Arrange
      const mockCategories = [
        createMockCategory({ id: 1 }),
        createMockCategory({ id: 2 }),
      ];
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

      // Act
      const result = await categoryRepository.findAll();

      // Assert
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: undefined,
        orderBy: { id: 'asc' }
      });
      expect(result).toEqual(mockCategories);
    });

    it('should find all categories with menus', async () => {
      // Arrange
      const mockCategories = [createMockCategory()];
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

      // Act
      const result = await categoryRepository.findAll({ includeMenus: true });

      // Assert
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: {
          menus: {
            where: { deletedAt: null }
          }
        },
        orderBy: { id: 'asc' }
      });
      expect(result).toEqual(mockCategories);
    });

    it('should support custom orderBy', async () => {
      // Arrange
      const mockCategories = [createMockCategory()];
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

      // Act
      await categoryRepository.findAll({ orderBy: { name: 'desc' } });

      // Assert
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: undefined,
        orderBy: { name: 'desc' }
      });
    });
  });

  describe('findById', () => {
    it('should find category by id without menus', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1 });
      vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory);

      // Act
      const result = await categoryRepository.findById(1);

      // Assert
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: undefined
      });
      expect(result).toEqual(mockCategory);
    });

    it('should find category by id with menus', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1 });
      vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory);

      // Act
      const result = await categoryRepository.findById(1, true);

      // Assert
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          menus: {
            where: { deletedAt: null }
          }
        }
      });
      expect(result).toEqual(mockCategory);
    });

    it('should return null if category not found', async () => {
      // Arrange
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      // Act
      const result = await categoryRepository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find category by name', async () => {
      // Arrange
      const mockCategory = createMockCategory({ name: 'Appetizers' });
      vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory);

      // Act
      const result = await categoryRepository.findByName('Appetizers');

      // Assert
      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { name: 'Appetizers', deletedAt: null }
      });
      expect(result).toEqual(mockCategory);
    });

    it('should return null if category not found', async () => {
      // Arrange
      vi.mocked(prisma.category.findFirst).mockResolvedValue(null);

      // Act
      const result = await categoryRepository.findByName('NonExistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create category', async () => {
      // Arrange
      const createData = { name: 'Beverages' };
      const mockCategory = createMockCategory(createData);
      vi.mocked(prisma.category.create).mockResolvedValue(mockCategory);

      // Act
      const result = await categoryRepository.create(createData);

      // Assert
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: createData
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should update category', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      const mockCategory = createMockCategory({ id: 1, name: 'Updated Name' });
      vi.mocked(prisma.category.update).mockResolvedValue(mockCategory);

      // Act
      const result = await categoryRepository.update(1, updateData);

      // Assert
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('delete', () => {
    it('should delete category', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1 });
      vi.mocked(prisma.category.delete).mockResolvedValue(mockCategory);

      // Act
      const result = await categoryRepository.delete(1);

      // Assert
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('hasMenus', () => {
    it('should return true if category has menus', async () => {
      // Arrange
      vi.mocked(prisma.menu.count).mockResolvedValue(5);

      // Act
      const result = await categoryRepository.hasMenus(1);

      // Assert
      expect(prisma.menu.count).toHaveBeenCalledWith({
        where: {
          categoryId: 1,
          deletedAt: null
        }
      });
      expect(result).toBe(true);
    });

    it('should return false if category has no menus', async () => {
      // Arrange
      vi.mocked(prisma.menu.count).mockResolvedValue(0);

      // Act
      const result = await categoryRepository.hasMenus(1);

      // Assert
      expect(result).toBe(false);
    });
  });
});
