import { ApiService } from './api';
import type { Category } from '@/types';

/**
 * Category Service
 * 
 * Handles all category-related API operations including:
 * - Fetching categories
 * - Creating new categories
 * - Updating existing categories
 * - Deleting categories
 */
class CategoryService extends ApiService {
  /**
   * Get all categories
   */
  async getCategories() {
    return this.get<Category[]>('/api/categories');
  }

  /**
   * Get single category by ID
   */
  async getCategoryById(id: number) {
    return this.get<Category>(`/api/categories/${id}`);
  }

  /**
   * Create new category
   */
  async createCategory(name: string) {
    return this.post<Category>('/api/categories', { name });
  }

  /**
   * Update existing category
   */
  async updateCategory(id: number, name: string) {
    return this.put<Category>(`/api/categories/${id}`, { name });
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number) {
    return this.delete(`/api/categories/${id}`);
  }
}

export const categoryService = new CategoryService();
