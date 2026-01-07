/**
 * @file Menu Service Tests
 * @description Unit tests for menu business logic
 * 
 * Tests cover:
 * - getMenus (grouped by category and paginated)
 * - getMenuById with validation
 * - createMenu with category validation
 * - updateMenu with validation
 * - deleteMenu (soft delete)
 * - toggleAvailability
 * - toggleVisibility
 * 
 * Best Practices:
 * - Mock Prisma client
 * - Test business logic
 * - Test DTO transformations
 * - Test error handling
 * - Test edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { menuService } from '@/business/services/menuService';
import { createMockMenu, createMockCategory } from '@/__tests__/helpers/testData';
import { NotFoundError } from '@/core/errors/AppError';
import { Decimal } from '@prisma/client/runtime/library';

// Mock the repositories
vi.mock('@/database/repositories/menuRepository', () => ({
  menuRepository: {
    findManyPaginated: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
}));

vi.mock('@/database/repositories/categoryRepository', () => ({
  categoryRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}));

import { menuRepository } from '@/database/repositories/menuRepository';
import { categoryRepository } from '@/database/repositories/categoryRepository';

describe('MenuService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMenus', () => {
    it('should return menus grouped by category (customer view)', async () => {
      // Arrange
      const mockCategories = [
        {
          ...createMockCategory({ id: 1, name: 'Appetizers' }),
          menus: [
            createMockMenu({ id: 1, nameTH: 'สลัด', categoryId: 1 }) as any,
            createMockMenu({ id: 2, nameTH: 'ปอเปี๊ยะทอด', categoryId: 1 }) as any,
          ],
        },
        {
          ...createMockCategory({ id: 2, name: 'Main Dishes' }),
          menus: [
            createMockMenu({ id: 3, nameTH: 'ข้าวผัด', categoryId: 2 }) as any,
          ],
        },
      ];

      vi.mocked(categoryRepository.findAll).mockResolvedValue(mockCategories as any);

      // Act
      const result = await menuService.getMenus({});

      // Assert
      expect(categoryRepository.findAll).toHaveBeenCalledWith({
        includeMenus: true,
        orderBy: { id: 'asc' },
      });
      expect(result).toHaveProperty('categories');
      expect(result.categories).toHaveLength(2);
    });

    it('should return paginated menus (admin view)', async () => {
      // Arrange
      const mockMenus = [
        createMockMenu({ id: 1 }),
        createMockMenu({ id: 2 }),
      ];

      vi.mocked(menuRepository.findManyPaginated).mockResolvedValue({
        menus: mockMenus,
        total: 10,
      });

      // Act
      const result = await menuService.getMenus({ scope: 'all', page: 1, limit: 2 });

      // Assert
      expect(menuRepository.findManyPaginated).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 2,
      });
      expect(result).toHaveProperty('menus');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 10,
        totalPages: 5,
      });
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      vi.mocked(menuRepository.findManyPaginated).mockResolvedValue({
        menus: [],
        total: 25,
      });

      // Act
      const result = await menuService.getMenus({ scope: 'all', page: 3, limit: 10 });

      // Assert
      expect(menuRepository.findManyPaginated).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 20,
        take: 10,
      });
      expect(result.pagination).toBeDefined();
      expect(result.pagination!.totalPages).toBe(3);
    });
  });

  describe('getMenuById', () => {
    it('should return menu by id', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1, nameTH: 'ข้าวผัด' });
      vi.mocked(menuRepository.findById).mockResolvedValue(mockMenu);

      // Act
      const result = await menuService.getMenuById(1);

      // Assert
      expect(menuRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('nameTH', 'ข้าวผัด');
    });

    it('should throw NotFoundError if menu does not exist', async () => {
      // Arrange
      vi.mocked(menuRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(menuService.getMenuById(999)).rejects.toThrow(NotFoundError);
      await expect(menuService.getMenuById(999)).rejects.toThrow('Menu not found');
    });

    it('should throw NotFoundError if menu is deleted', async () => {
      // Arrange
      const deletedMenu = createMockMenu({ id: 1, deletedAt: new Date() });
      vi.mocked(menuRepository.findById).mockResolvedValue(deletedMenu);

      // Act & Assert
      await expect(menuService.getMenuById(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createMenu', () => {
    it('should create menu with valid data', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1 });
      const createData = {
        nameTH: 'ข้าวผัด',
        nameEN: 'Fried Rice',
        description: 'Delicious fried rice',
        price: 50,
        categoryId: 1,
        imageUrl: 'https://example.com/image.jpg',
        isRecommended: true,
        isAvailable: true,
        isVisible: true,
      };
      const mockCreatedMenu = createMockMenu({ ...createData, price: new Decimal(50) });

      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory);
      vi.mocked(menuRepository.create).mockResolvedValue(mockCreatedMenu);

      // Act
      const result = await menuService.createMenu(createData);

      // Assert
      expect(categoryRepository.findById).toHaveBeenCalledWith(1);
      expect(menuRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nameTH: 'ข้าวผัด',
          nameEN: 'Fried Rice',
          price: 50,
        })
      );
      expect(result).toHaveProperty('nameTH', 'ข้าวผัด');
    });

    it('should throw NotFoundError if category does not exist', async () => {
      // Arrange
      const createData = {
        nameTH: 'ข้าวผัด',
        price: 50,
        categoryId: 999,
      };

      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(menuService.createMenu(createData as any)).rejects.toThrow(NotFoundError);
      await expect(menuService.createMenu(createData as any)).rejects.toThrow('Category not found');
    });

    it('should set default values for optional fields', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1 });
      const createData = {
        nameTH: 'ข้าวผัด',
        price: 50,
        categoryId: 1,
      };
      const mockCreatedMenu = createMockMenu({ ...createData, price: new Decimal(50) });

      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory);
      vi.mocked(menuRepository.create).mockResolvedValue(mockCreatedMenu);

      // Act
      await menuService.createMenu(createData as any);

      // Assert
      expect(menuRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nameEN: '',
          imageUrl: '',
          isRecommended: false,
          isAvailable: true,
          isVisible: true,
        })
      );
    });
  });

  describe('updateMenu', () => {
    it('should update menu with valid data', async () => {
      // Arrange
      const existingMenu = createMockMenu({ id: 1 });
      const updateData = {
        nameTH: 'ข้าวผัดอัพเดท',
        price: 60,
      };
      const updatedMenu = createMockMenu({ ...existingMenu, nameTH: updateData.nameTH, price: new Decimal(60) });

      vi.mocked(menuRepository.findById).mockResolvedValue(existingMenu);
      vi.mocked(menuRepository.update).mockResolvedValue(updatedMenu);

      // Act
      const result = await menuService.updateMenu(1, updateData);

      // Assert
      expect(menuRepository.findById).toHaveBeenCalledWith(1);
      expect(menuRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toHaveProperty('nameTH', 'ข้าวผัดอัพเดท');
    });

    it('should throw NotFoundError if menu does not exist', async () => {
      // Arrange
      vi.mocked(menuRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(menuService.updateMenu(999, { nameTH: 'test' })).rejects.toThrow(NotFoundError);
    });

    it('should validate category if categoryId is being updated', async () => {
      // Arrange
      const existingMenu = createMockMenu({ id: 1 });
      const mockCategory = createMockCategory({ id: 2 });
      const updateData = { categoryId: 2 };

      vi.mocked(menuRepository.findById).mockResolvedValue(existingMenu);
      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory);
      vi.mocked(menuRepository.update).mockResolvedValue(existingMenu);

      // Act
      await menuService.updateMenu(1, updateData);

      // Assert
      expect(categoryRepository.findById).toHaveBeenCalledWith(2);
    });

    it('should throw NotFoundError if new category does not exist', async () => {
      // Arrange
      const existingMenu = createMockMenu({ id: 1 });
      vi.mocked(menuRepository.findById).mockResolvedValue(existingMenu);
      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(menuService.updateMenu(1, { categoryId: 999 })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteMenu', () => {
    it('should soft delete menu', async () => {
      // Arrange
      const existingMenu = createMockMenu({ id: 1 });
      const deletedMenu = createMockMenu({ id: 1, deletedAt: new Date() });

      vi.mocked(menuRepository.findById).mockResolvedValue(existingMenu);
      vi.mocked(menuRepository.softDelete).mockResolvedValue(deletedMenu);

      // Act
      const result = await menuService.deleteMenu(1);

      // Assert
      expect(menuRepository.findById).toHaveBeenCalledWith(1);
      expect(menuRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
    });

    it('should throw NotFoundError if menu does not exist', async () => {
      // Arrange
      vi.mocked(menuRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(menuService.deleteMenu(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle availability from true to false', async () => {
      // Arrange
      const menu = createMockMenu({ id: 1, isAvailable: true });
      const updatedMenu = createMockMenu({ id: 1, isAvailable: false });

      vi.mocked(menuRepository.findById).mockResolvedValue(menu);
      vi.mocked(menuRepository.update).mockResolvedValue(updatedMenu);

      // Act
      const result = await menuService.toggleAvailability(1);

      // Assert
      expect(menuRepository.update).toHaveBeenCalledWith(1, { isAvailable: false });
      expect(result).toHaveProperty('isAvailable', false);
    });

    it('should toggle availability from false to true', async () => {
      // Arrange
      const menu = createMockMenu({ id: 1, isAvailable: false });
      const updatedMenu = createMockMenu({ id: 1, isAvailable: true });

      vi.mocked(menuRepository.findById).mockResolvedValue(menu);
      vi.mocked(menuRepository.update).mockResolvedValue(updatedMenu);

      // Act
      const result = await menuService.toggleAvailability(1);

      // Assert
      expect(menuRepository.update).toHaveBeenCalledWith(1, { isAvailable: true });
      expect(result).toHaveProperty('isAvailable', true);
    });
  });

  describe('toggleVisibility', () => {
    it('should toggle visibility from true to false', async () => {
      // Arrange
      const menu = createMockMenu({ id: 1, isVisible: true });
      const updatedMenu = createMockMenu({ id: 1, isVisible: false });

      vi.mocked(menuRepository.findById).mockResolvedValue(menu);
      vi.mocked(menuRepository.update).mockResolvedValue(updatedMenu);

      // Act
      const result = await menuService.toggleVisibility(1);

      // Assert
      expect(menuRepository.update).toHaveBeenCalledWith(1, { isVisible: false });
      expect(result).toHaveProperty('isVisible', false);
    });

    it('should toggle visibility from false to true', async () => {
      // Arrange
      const menu = createMockMenu({ id: 1, isVisible: false });
      const updatedMenu = createMockMenu({ id: 1, isVisible: true });

      vi.mocked(menuRepository.findById).mockResolvedValue(menu);
      vi.mocked(menuRepository.update).mockResolvedValue(updatedMenu);

      // Act
      const result = await menuService.toggleVisibility(1);

      // Assert
      expect(menuRepository.update).toHaveBeenCalledWith(1, { isVisible: true });
      expect(result).toHaveProperty('isVisible', true);
    });
  });
});
