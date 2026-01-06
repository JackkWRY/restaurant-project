/**
 * @file Category Service
 * @description Business logic layer for category management
 * 
 * This service handles:
 * - Category CRUD operations
 * - Category name uniqueness validation
 * - Referential integrity checks
 * - Menu relationship validation
 * 
 * Business rules:
 * - Category names must be unique
 * - Cannot delete categories with existing menus
 * 
 * @module services/categoryService
 * @requires repositories/categoryRepository
 * @requires errors/AppError
 * 
 * @see {@link ../controllers/categoryController.ts} for HTTP handlers
 */

import { categoryRepository } from '../../database/repositories/categoryRepository.js';
import { NotFoundError, ConflictError } from '../../core/errors/AppError.js';
export class CategoryService {
  /**
   * Retrieves all categories
   * 
   * @returns Array of all categories
   */
  async getCategories() {
    return await categoryRepository.findAll();
  }

  /**
   * Retrieves a single category by ID
   * 
   * @param id - Category ID
   * @returns Category data
   * @throws {NotFoundError} If category doesn't exist
   */
  async getCategoryById(id: number) {
    const category = await categoryRepository.findById(id, true);

    if (!category) {
      throw new NotFoundError('Category');
    }

    return category;
  }

  /**
   * Creates a new category with validation
   * 
   * Validates that category name is unique before creation.
   * 
   * @param data - Category creation data
   * @returns Created category
   * @throws {ConflictError} If category name already exists
   * 
   * @example
   * const category = await categoryService.createCategory({ name: "Appetizers" });
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
   * Updates an existing category with validation
   * 
   * Validates category exists and name uniqueness if name is being updated.
   * 
   * @param id - Category ID
   * @param data - Update data
   * @returns Updated category
   * @throws {NotFoundError} If category doesn't exist
   * @throws {ConflictError} If new name already exists
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
   * Deletes a category with safety checks
   * 
   * Validates category has no associated menus before deletion.
   * 
   * @param id - Category ID
   * @returns Success message
   * @throws {NotFoundError} If category doesn't exist
   * @throws {ConflictError} If category has menus
   */
  async deleteCategory(id: number) {
    // Check category exists
    await this.getCategoryById(id);

    // Business rule: Maintain referential integrity
    // Cannot delete categories that have menu items
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
