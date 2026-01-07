import { ApiService } from './api';
import type { Menu, Category } from '@/types';

/**
 * Menu Service
 * 
 * Handles all menu-related API operations including:
 * - Fetching menus (grouped by category or paginated)
 * - Creating new menu items
 * - Updating existing menu items
 * - Deleting menu items
 * - Toggling menu availability and visibility
 */
class MenuService extends ApiService {
  /**
   * Get all menus grouped by categories (customer view)
   */
  async getMenus() {
    return this.get<{ categories: Category[] }>('/api/v1/menus');
  }

  /**
   * Get paginated menus (admin view)
   */
  async getMenusPaginated(page: number = 1, limit: number = 100) {
    return this.get<{ 
      menus: Menu[]; 
      pagination: { page: number; limit: number; total: number; totalPages: number } 
    }>(
      `/api/v1/menus?scope=all&page=${page}&limit=${limit}`
    );
  }

  /**
   * Get single menu by ID
   */
  async getMenuById(id: number) {
    return this.get<Menu>(`/api/v1/menus/${id}`);
  }

  /**
   * Create new menu item
   */
  async createMenu(data: Partial<Menu>) {
    return this.post<Menu>('/api/v1/menus', data);
  }

  /**
   * Update existing menu item
   */
  async updateMenu(id: number, data: Partial<Menu>) {
    return this.put<Menu>(`/api/v1/menus/${id}`, data);
  }

  /**
   * Delete menu item (soft delete)
   */
  async deleteMenu(id: number) {
    return this.delete(`/api/v1/menus/${id}`);
  }

  /**
   * Toggle menu availability status
   */
  async toggleAvailability(id: number) {
    return this.patch<Menu>(`/api/v1/menus/${id}/availability`, {});
  }

  /**
   * Toggle menu visibility status
   */
  async toggleVisibility(id: number) {
    return this.patch<Menu>(`/api/v1/menus/${id}/visibility`, {});
  }
}

export const menuService = new MenuService();
