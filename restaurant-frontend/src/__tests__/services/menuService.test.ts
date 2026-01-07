/**
 * @file Menu Service Tests
 * @description Unit tests for menu API service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { menuService } from '@/services/menuService';

// Mock authFetch
vi.mock('@/lib/utils', () => ({
  API_URL: 'http://localhost:3001',
  authFetch: vi.fn(),
}));

import { authFetch } from '@/lib/utils';

describe('MenuService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMenus', () => {
    it('should fetch menus grouped by categories', async () => {
      const mockData = { categories: [{ id: 1, name: 'Main Course' }] };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockData }),
      } as Response);

      const result = await menuService.getMenus();

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/menus');
      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getMenusPaginated', () => {
    it('should fetch paginated menus with correct query params', async () => {
      const mockData = { 
        menus: [], 
        pagination: { page: 1, limit: 10, total: 50, totalPages: 5 } 
      };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockData }),
      } as Response);

      await menuService.getMenusPaginated(1, 10);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/menus?scope=all&page=1&limit=10'
      );
    });
  });

  describe('getMenuById', () => {
    it('should fetch single menu by id', async () => {
      const mockMenu = { id: 1, nameTH: 'ข้าวผัด', price: 50 };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockMenu }),
      } as Response);

      const result = await menuService.getMenuById(1);

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/menus/1');
      expect(result.data).toEqual(mockMenu);
    });
  });

  describe('createMenu', () => {
    it('should create menu with POST request', async () => {
      const menuData = { nameTH: 'ข้าวผัด', price: 50, categoryId: 1 };
      const mockResponse = { id: 1, ...menuData };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockResponse }),
      } as Response);

      await menuService.createMenu(menuData);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/menus',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menuData),
        })
      );
    });
  });

  describe('updateMenu', () => {
    it('should update menu with PUT request', async () => {
      const updateData = { price: 60 };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { id: 1, ...updateData } }),
      } as Response);

      await menuService.updateMenu(1, updateData);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/menus/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe('deleteMenu', () => {
    it('should delete menu with DELETE request', async () => {
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success' }),
      } as Response);

      await menuService.deleteMenu(1);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/menus/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle availability with PATCH request', async () => {
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { id: 1, isAvailable: false } }),
      } as Response);

      await menuService.toggleAvailability(1);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/menus/1/availability',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('toggleVisibility', () => {
    it('should toggle visibility with PATCH request', async () => {
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { id: 1, isVisible: false } }),
      } as Response);

      await menuService.toggleVisibility(1);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/menus/1/visibility',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });
});
