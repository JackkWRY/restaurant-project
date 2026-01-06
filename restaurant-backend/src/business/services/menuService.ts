/**
 * @file Menu Service
 * @description Business logic layer for menu management
 * 
 * This service handles:
 * - Menu retrieval with filtering and pagination
 * - Menu CRUD operations
 * - Category validation
 * - Soft delete implementation
 * - Availability and visibility toggles
 * 
 * Features:
 * - Two view modes: customer (grouped by category) and admin (paginated)
 * - Soft delete with deletedAt timestamp
 * - Category relationship validation
 * 
 * @module services/menuService
 * @requires repositories/menuRepository
 * @requires repositories/categoryRepository
 * @requires errors/AppError
 * @requires dtos/menuDto
 * 
 * @see {@link ../controllers/menuController.ts} for HTTP handlers
 */

import prisma from '../../database/client/prisma.js';
import { menuRepository } from '../../database/repositories/menuRepository.js';
import { categoryRepository } from '../../database/repositories/categoryRepository.js';
import { NotFoundError, ValidationError } from '../../core/errors/AppError.js';
import type { CreateMenuInput, UpdateMenuInput } from '../../core/types/menu.ts';
import { MenuDto, CategoryDto } from '../dtos/menuDto.js';
export class MenuService {
  /**
   * Retrieves all menus with optional filtering and pagination
   * 
   * Supports two modes:
   * - scope='all': Returns paginated list of all menus (for admin management)
   * - default: Returns menus grouped by categories (for customer ordering)
   * 
   * The grouped view improves customer browsing experience by organizing
   * items into logical categories (Appetizers, Main Dishes, etc.)
   * 
   * @param options - Query options with scope, page, and limit
   * @returns Paginated menus or categories with menus
   * @throws {Error} If database query fails
   * 
   * @example
   * // Get menus grouped by category (customer view)
   * const result = await menuService.getMenus({});
   * 
   * @example
   * // Get paginated list (admin view)
   * const result = await menuService.getMenus({ scope: 'all', page: 1, limit: 10 });
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

    // For customer view - group menus by category
    // This provides a better browsing experience
    const categories = await categoryRepository.findAll({
      includeMenus: true,
      orderBy: { id: 'asc' }
    });

    return { categories: CategoryDto.fromPrismaMany(categories) };
  }

  /**
   * Retrieves a single menu by ID
   * 
   * @param id - Menu ID
   * @returns Menu data with DTO transformation
   * @throws {NotFoundError} If menu doesn't exist or is deleted
   */
  async getMenuById(id: number) {
    const menu = await menuRepository.findById(id);

    if (!menu || menu.deletedAt) {
      throw new NotFoundError('Menu');
    }

    return MenuDto.fromPrisma(menu);
  }

  /**
   * Creates a new menu item with validation
   * 
   * Validates that the category exists before creating the menu.
   * Sets default values for optional fields.
   * 
   * @param data - Menu creation data
   * @returns Created menu with DTO transformation
   * @throws {NotFoundError} If category doesn't exist
   * 
   * @example
   * const menu = await menuService.createMenu({
   *   nameTH: "ข้าวผัด",
   *   nameEN: "Fried Rice",
   *   price: 50,
   *   categoryId: 1,
   *   imageUrl: "https://...",
   *   isRecommended: true,
   *   isAvailable: true,
   *   isVisible: true
   * });
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
   * Updates an existing menu with validation
   * 
   * Validates menu exists and category exists if being updated.
   * 
   * @param id - Menu ID
   * @param data - Update data
   * @returns Updated menu with DTO transformation
   * @throws {NotFoundError} If menu or category doesn't exist
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
   * Soft deletes a menu item
   * 
   * Sets deletedAt timestamp instead of permanent deletion.
   * 
   * @param id - Menu ID
   * @returns Deleted menu with DTO transformation
   * @throws {NotFoundError} If menu doesn't exist
   */
  async deleteMenu(id: number) {
    // Check menu exists
    await this.getMenuById(id);

    const menu = await menuRepository.softDelete(id);

    return MenuDto.fromPrisma(menu);
  }

  /**
   * Toggles menu availability status
   * 
   * Controls whether customers can order this item.
   * 
   * @param id - Menu ID
   * @returns Updated menu with DTO transformation
   * @throws {NotFoundError} If menu doesn't exist
   */
  async toggleAvailability(id: number) {
    const menu = await this.getMenuById(id);

    const updated = await menuRepository.update(id, {
      isAvailable: !menu.isAvailable
    });

    return MenuDto.fromPrisma(updated);
  }

  /**
   * Toggles menu visibility status
   * 
   * Controls whether this item appears in the menu list.
   * 
   * @param id - Menu ID
   * @returns Updated menu with DTO transformation
   * @throws {NotFoundError} If menu doesn't exist
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
