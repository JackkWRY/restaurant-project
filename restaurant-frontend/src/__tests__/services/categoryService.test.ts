/**
 * @file Category Service Tests
 * @description Unit tests for category API service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { categoryService } from '@/services/categoryService';

vi.mock('@/lib/utils', () => ({
  API_URL: 'http://localhost:3001',
  authFetch: vi.fn(),
}));

import { authFetch } from '@/lib/utils';

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should fetch all categories', async () => {
      const mockCategories = [{ id: 1, name: 'Main Course' }];
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockCategories }),
      } as Response);

      const result = await categoryService.getCategories();

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/categories');
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe('getCategoryById', () => {
    it('should fetch single category by id', async () => {
      const mockCategory = { id: 1, name: 'Main Course' };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockCategory }),
      } as Response);

      await categoryService.getCategoryById(1);

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/categories/1');
    });
  });

  describe('createCategory', () => {
    it('should create category with POST request', async () => {
      const categoryName = 'Desserts';
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { id: 1, name: categoryName } }),
      } as Response);

      await categoryService.createCategory(categoryName);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/categories',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: categoryName }),
        })
      );
    });
  });

  describe('updateCategory', () => {
    it('should update category with PUT request', async () => {
      const newName = 'Updated Category';
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { id: 1, name: newName } }),
      } as Response);

      await categoryService.updateCategory(1, newName);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/categories/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: newName }),
        })
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete category with DELETE request', async () => {
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success' }),
      } as Response);

      await categoryService.deleteCategory(1);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/categories/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
