import prisma from '../prisma.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';
import type { CreateMenuInput, UpdateMenuInput } from '../types/menu.ts';

/**
 * Menu Service
 * Handles all business logic related to menus
 */
export class MenuService {
  /**
   * Get all menus with optional filtering and pagination
   */
  async getMenus(options: {
    scope?: string;
    page?: number;
    limit?: number;
  }) {
    const { scope, page = 1, limit = 100 } = options;
    const skip = (page - 1) * limit;

    if (scope === 'all') {
      const where = { deletedAt: null };
      
      const [menus, total] = await Promise.all([
        prisma.menu.findMany({
          where,
          include: { category: true },
          orderBy: { id: 'desc' },
          skip,
          take: limit
        }),
        prisma.menu.count({ where })
      ]);

      return {
        menus,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    // For customer view - grouped by category
    const categories = await prisma.category.findMany({
      include: {
        menus: {
          where: { 
            isVisible: true,
            deletedAt: null 
          }, 
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    return { categories };
  }

  /**
   * Get menu by ID
   */
  async getMenuById(id: number) {
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!menu || menu.deletedAt) {
      throw new NotFoundError('Menu');
    }

    return menu;
  }

  /**
   * Create new menu
   */
  async createMenu(data: CreateMenuInput) {
    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    const menu = await prisma.menu.create({
      data: {
        nameTH: data.nameTH,
        nameEN: data.nameEN || '',
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl || '',
        isRecommended: data.isRecommended || false,
        isAvailable: data.isAvailable ?? true,
        isVisible: data.isVisible ?? true
      },
      include: { category: true }
    });

    return menu;
  }

  /**
   * Update menu
   */
  async updateMenu(id: number, data: UpdateMenuInput) {
    // Check menu exists
    await this.getMenuById(id);

    // If categoryId is being updated, validate it exists
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new NotFoundError('Category');
      }
    }

    const menu = await prisma.menu.update({
      where: { id },
      data,
      include: { category: true }
    });

    return menu;
  }

  /**
   * Soft delete menu
   */
  async deleteMenu(id: number) {
    // Check menu exists
    await this.getMenuById(id);

    const menu = await prisma.menu.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return menu;
  }

  /**
   * Toggle menu availability
   */
  async toggleAvailability(id: number) {
    const menu = await this.getMenuById(id);

    const updated = await prisma.menu.update({
      where: { id },
      data: { isAvailable: !menu.isAvailable }
    });

    return updated;
  }

  /**
   * Toggle menu visibility
   */
  async toggleVisibility(id: number) {
    const menu = await this.getMenuById(id);

    const updated = await prisma.menu.update({
      where: { id },
      data: { isVisible: !menu.isVisible }
    });

    return updated;
  }
}

// Export singleton instance
export const menuService = new MenuService();
