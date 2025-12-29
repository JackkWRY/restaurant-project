import prisma from '../prisma.js';
import { menuRepository } from '../repositories/menuRepository.js';
import { categoryRepository } from '../repositories/categoryRepository.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';
import type { CreateMenuInput, UpdateMenuInput } from '../types/menu.ts';
import { MenuDto, CategoryDto } from '../dtos/menuDto.js';

/**
 * Menu Service
 * Handles all business logic related to menus
 * Now uses Repository for data access
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
      
      const { menus, total } = await menuRepository.findManyPaginated({
        where,
        skip,
        take: limit
      });

      return {
        menus: MenuDto.fromPrismaMany(menus),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    // For customer view - grouped by category
    const categories = await categoryRepository.findAll({
      includeMenus: true,
      orderBy: { id: 'asc' }
    });

    return { categories: CategoryDto.fromPrismaMany(categories) };
  }

  /**
   * Get menu by ID
   */
  async getMenuById(id: number) {
    const menu = await menuRepository.findById(id);

    if (!menu || menu.deletedAt) {
      throw new NotFoundError('Menu');
    }

    return MenuDto.fromPrisma(menu);
  }

  /**
   * Create new menu
   */
  async createMenu(data: CreateMenuInput) {
    // Validate category exists
    const category = await categoryRepository.findById(data.categoryId);

    if (!category) {
      throw new NotFoundError('Category');
    }

    const menu = await menuRepository.create({
      nameTH: data.nameTH,
      nameEN: data.nameEN || '',
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl || '',
      isRecommended: data.isRecommended || false,
      isAvailable: data.isAvailable ?? true,
      isVisible: data.isVisible ?? true,
      category: {
        connect: { id: data.categoryId }
      }
    });

    return MenuDto.fromPrisma(menu);
  }

  /**
   * Update menu
   */
  async updateMenu(id: number, data: UpdateMenuInput) {
    // Check menu exists
    await this.getMenuById(id);

    // If categoryId is being updated, validate it exists
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new NotFoundError('Category');
      }
    }

    const menu = await menuRepository.update(id, data);

    return MenuDto.fromPrisma(menu);
  }

  /**
   * Soft delete menu
   */
  async deleteMenu(id: number) {
    // Check menu exists
    await this.getMenuById(id);

    const menu = await menuRepository.softDelete(id);

    return MenuDto.fromPrisma(menu);
  }

  /**
   * Toggle menu availability
   */
  async toggleAvailability(id: number) {
    const menu = await this.getMenuById(id);

    const updated = await menuRepository.update(id, {
      isAvailable: !menu.isAvailable
    });

    return MenuDto.fromPrisma(updated);
  }

  /**
   * Toggle menu visibility
   */
  async toggleVisibility(id: number) {
    const menu = await this.getMenuById(id);

    const updated = await menuRepository.update(id, {
      isVisible: !menu.isVisible
    });

    return MenuDto.fromPrisma(updated);
  }
}

// Export singleton instance
export const menuService = new MenuService();
