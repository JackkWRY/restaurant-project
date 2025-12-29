import { categoryRepository } from '../repositories/categoryRepository.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';

/**
 * Category Service
 * Handles all business logic related to categories
 * Now uses Repository for data access
 */
export class CategoryService {
  /**
   * Get all categories
   */
  async getCategories() {
    return await categoryRepository.findAll();
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number) {
    const category = await categoryRepository.findById(id, true);

    if (!category) {
      throw new NotFoundError('Category');
    }

    return category;
  }

  /**
   * Create new category
   */
  async createCategory(data: { name: string }) {
    // Check if category name already exists
    const existing = await categoryRepository.findByName(data.name);

    if (existing) {
      throw new ConflictError('Category name already exists');
    }

    return await categoryRepository.create({
      name: data.name
    });
  }

  /**
   * Update category
   */
  async updateCategory(id: number, data: { name?: string }) {
    // Check category exists
    await this.getCategoryById(id);

    // If name is being updated, check for duplicates
    if (data.name) {
      const existing = await categoryRepository.findByName(data.name);

      if (existing && existing.id !== id) {
        throw new ConflictError('Category name already exists');
      }
    }

    return await categoryRepository.update(id, data);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number) {
    // Check category exists
    await this.getCategoryById(id);

    // Check if category has menus
    const hasMenus = await categoryRepository.hasMenus(id);

    if (hasMenus) {
      throw new ConflictError('Cannot delete category with existing menus');
    }

    await categoryRepository.delete(id);

    return { message: 'Category deleted successfully' };
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
