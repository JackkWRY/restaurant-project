import prisma from '../prisma.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';

/**
 * Category Service
 * Handles all business logic related to categories
 */
export class CategoryService {
  /**
   * Get all categories
   */
  async getCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' }
    });

    return categories;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        menus: {
          where: { deletedAt: null }
        }
      }
    });

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
    const existing = await prisma.category.findFirst({
      where: { name: data.name }
    });

    if (existing) {
      throw new ConflictError('Category name already exists');
    }

    const category = await prisma.category.create({
      data: {
        name: data.name
      }
    });

    return category;
  }

  /**
   * Update category
   */
  async updateCategory(id: number, data: { name?: string }) {
    // Check category exists
    await this.getCategoryById(id);

    // If name is being updated, check for duplicates
    if (data.name) {
      const existing = await prisma.category.findFirst({
        where: {
          name: data.name,
          id: { not: id }
        }
      });

      if (existing) {
        throw new ConflictError('Category name already exists');
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data
    });

    return category;
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number) {
    // Check category exists
    const category = await this.getCategoryById(id);

    // Check if category has menus
    if (category.menus && category.menus.length > 0) {
      throw new ConflictError('Cannot delete category with existing menus');
    }

    await prisma.category.delete({
      where: { id }
    });

    return { message: 'Category deleted successfully' };
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
