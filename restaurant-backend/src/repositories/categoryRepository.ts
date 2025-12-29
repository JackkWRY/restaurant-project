import prisma from '../prisma.js';
import type { Category, Prisma } from '@prisma/client';

/**
 * Category Repository
 * Handles all database operations for Category model
 */
export class CategoryRepository {
  /**
   * Find all categories
   */
  async findAll(options?: {
    includeMenus?: boolean;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }) {
    return await prisma.category.findMany({
      include: options?.includeMenus ? {
        menus: {
          where: { deletedAt: null }
        }
      } : undefined,
      orderBy: options?.orderBy || { id: 'asc' }
    });
  }

  /**
   * Find category by ID
   */
  async findById(id: number, includeMenus = false) {
    return await prisma.category.findUnique({
      where: { id },
      include: includeMenus ? {
        menus: {
          where: { deletedAt: null }
        }
      } : undefined
    });
  }

  /**
   * Find category by name
   */
  async findByName(name: string) {
    return await prisma.category.findFirst({
      where: { name }
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
   * Delete category
   */
  async delete(id: number) {
    return await prisma.category.delete({
      where: { id }
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
