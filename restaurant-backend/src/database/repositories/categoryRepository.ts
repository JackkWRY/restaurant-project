/**
 * @file Category Repository
 * @description Data access layer for category-related database operations
 * 
 * @module repositories/categoryRepository
 * @requires @prisma/client
 * @requires prisma
 * @see {@link ../services/categoryService.ts}
 */

import prisma from '../client/prisma.js';
import type { Category, Prisma } from '@prisma/client';

export class CategoryRepository {
  /**
   * Find all categories
   * 
   * Performance: Conditionally loads menus to avoid unnecessary data.
   * Validation: Filters out soft-deleted menus when included.
   * 
   * @param options - Optional includeMenus and orderBy
   * @returns Array of categories with optional menu relations
   */
  async findAll(options?: {
    includeMenus?: boolean;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }) {
    // Conditionally include menus to optimize query performance
    // Only load menus when needed (e.g., customer menu view)
    return await prisma.category.findMany({
      where: { deletedAt: null },  // Filter out soft-deleted categories
      include: options?.includeMenus ? {
        menus: {
          // Filter out soft-deleted menus
          where: { deletedAt: null }
        }
      } : undefined,
      // Default to ID ascending for consistent category ordering
      orderBy: options?.orderBy || { id: 'asc' }
    });
  }

  /**
   * Find category by ID
   * 
   * Performance: Uses primary key for O(1) lookup.
   * 
   * @param id - Category ID
   * @param includeMenus - Whether to include related menus
   * @returns Category with optional menus, or null if not found
   */
  async findById(id: number, includeMenus = false) {
    // Primary key lookup with optional menu relation
    const category = await prisma.category.findUnique({
      where: { id },
      include: includeMenus ? {
        menus: {
          where: { deletedAt: null }
        }
      } : undefined
    });
    
    // Return null if category is soft-deleted
    if (category?.deletedAt) return null;
    return category;
  }

  /**
   * Find category by name
   */
  async findByName(name: string) {
    return await prisma.category.findFirst({
      where: { 
        name,
        deletedAt: null  // Only find active categories
      }
    });
  }

  /**
   * Create new category
   */
  async create(data: Prisma.CategoryCreateInput) {
    return await prisma.category.create({
      data
    });
  }

  /**
   * Update category
   */
  async update(id: number, data: Prisma.CategoryUpdateInput) {
    return await prisma.category.update({
      where: { id },
      data
    });
  }

  /**
   * Hard delete category (use softDelete instead)
   */
  async delete(id: number) {
    return await prisma.category.delete({
      where: { id }
    });
  }

  /**
   * Soft delete category by setting deletedAt timestamp
   * 
   * Preserves data for audit trail and potential recovery.
   * Category will be filtered out from queries but remains in database.
   */
  async softDelete(id: number) {
    return await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Check if category has menus
   */
  async hasMenus(id: number): Promise<boolean> {
    const count = await prisma.menu.count({
      where: {
        categoryId: id,
        deletedAt: null
      }
    });
    return count > 0;
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
