/**
 * @file Category Service Tests
 * @description Unit tests for category management business logic
 * 
 * Tests cover:
 * - getAllCategories retrieval
 * - getCategoryById with validation
 * - createCategory with uniqueness check
 * - updateCategory with validation
 * - deleteCategory with menu check
 * - Error handling
 * 
 * Best Practices:
 * - Mock repository methods
 * - Test business logic
 * - Test validation rules
 * - Test error conditions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { categoryService } from '@/business/services/categoryService';
import { createMockCategory } from '@/__tests__/helpers/testData';
import { NotFoundError, ConflictError } from '@/core/errors/AppError';

// Mock repositories
vi.mock('@/database/repositories/categoryRepository', () => ({
  categoryRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    hasMenus: vi.fn(),
    delete: vi.fn(),
  },
}));

import { categoryRepository } from '@/database/repositories/categoryRepository';

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      // Arrange
      const mockCategories = [
        createMockCategory({ id: 1, name: 'Appetizers' }),
        createMockCategory({ id: 2, name: 'Main Dishes' }),
        createMockCategory({ id: 3, name: 'Desserts' }),
      ];

      vi.mocked(categoryRepository.findAll).mockResolvedValue(mockCategories);

      // Act
      const result = await categoryService.getCategories();

      // Assert
      expect(categoryRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('name', 'Appetizers');
    });

    it('should return empty array if no categories exist', async () => {
      // Arrange
      vi.mocked(categoryRepository.findAll).mockResolvedValue([]);

      // Act
      const result = await categoryService.getCategories();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1, name: 'Appetizers' });
      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory);

      // Act
      const result = await categoryService.getCategoryById(1);

      // Assert
      expect(categoryRepository.findById).toHaveBeenCalledWith(1, true);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Appetizers');
    });

    it('should throw NotFoundError if category does not exist', async () => {
      // Arrange
      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(categoryService.getCategoryById(999)).rejects.toThrow(NotFoundError);
      await expect(categoryService.getCategoryById(999)).rejects.toThrow('Category not found');
    });
  });

  describe('createCategory', () => {
    it('should create category with unique name', async () => {
      // Arrange
      const createData = { name: 'Beverages' };
      const mockCreatedCategory = createMockCategory({ id: 4, name: 'Beverages' });

      vi.mocked(categoryRepository.findByName).mockResolvedValue(null);
      vi.mocked(categoryRepository.create).mockResolvedValue(mockCreatedCategory);

      // Act
      const result = await categoryService.createCategory(createData);

      // Assert
      expect(categoryRepository.findByName).toHaveBeenCalledWith('Beverages');
      expect(categoryRepository.create).toHaveBeenCalledWith(createData);
      expect(result).toHaveProperty('name', 'Beverages');
    });

    it('should throw ConflictError if category name already exists', async () => {
      // Arrange
      const existingCategory = createMockCategory({ id: 1, name: 'Appetizers' });
      const createData = { name: 'Appetizers' };

      vi.mocked(categoryRepository.findByName).mockResolvedValue(existingCategory);

      // Act & Assert
      await expect(categoryService.createCategory(createData)).rejects.toThrow(ConflictError);
      await expect(categoryService.createCategory(createData)).rejects.toThrow('Category name already exists');
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1, name: 'Appetizers' });
      const updatedCategory = createMockCategory({ id: 1, name: 'Starters' });

      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory);
      vi.mocked(categoryRepository.findByName).mockResolvedValue(null);
      vi.mocked(categoryRepository.update).mockResolvedValue(updatedCategory);

      // Act
      const result = await categoryService.updateCategory(1, { name: 'Starters' });

      // Assert
      expect(categoryRepository.findById).toHaveBeenCalledWith(1, true);
      expect(categoryRepository.update).toHaveBeenCalledWith(1, { name: 'Starters' });
      expect(result).toHaveProperty('name', 'Starters');
    });

    it('should throw NotFoundError if category does not exist', async () => {
      // Arrange
      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(categoryService.updateCategory(999, { name: 'Test' })).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if new name already exists', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1, name: 'Appetizers' });
      const existingCategory = createMockCategory({ id: 2, name: 'Main Dishes' });

      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory);
      vi.mocked(categoryRepository.findByName).mockResolvedValue(existingCategory);

      // Act & Assert
      await expect(categoryService.updateCategory(1, { name: 'Main Dishes' })).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1 });

      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory as any);
      vi.mocked(categoryRepository.hasMenus).mockResolvedValue(false);
      vi.mocked(categoryRepository.delete).mockResolvedValue({} as any);

      // Act
      const result = await categoryService.deleteCategory(1);

      // Assert
      expect(categoryRepository.findById).toHaveBeenCalledWith(1, true);
      expect(categoryRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Category deleted successfully' });
    });

    it('should throw NotFoundError if category does not exist', async () => {
      // Arrange
      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(categoryService.deleteCategory(999)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if category has menus', async () => {
      // Arrange
      const mockCategory = createMockCategory({ id: 1 });

      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory as any);
      vi.mocked(categoryRepository.hasMenus).mockResolvedValue(true);

      // Act & Assert
      await expect(categoryService.deleteCategory(1)).rejects.toThrow(ConflictError);
      await expect(categoryService.deleteCategory(1)).rejects.toThrow('Cannot delete category with existing menus');
    });
  });
});
