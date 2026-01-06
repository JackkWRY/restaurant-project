/**
 * @file Menu and Category Data Transfer Objects
 * @description DTOs for menu and category-related API responses
 * 
 * This file provides:
 * - MenuDto: Menu item information with category
 * - CategoryDto: Category information with optional menus
 * - Transformation from Prisma models
 * - Circular reference prevention
 * - Security filtering (deletedAt not exposed)
 * 
 * Property descriptions (MenuDto):
 * - id: Unique menu identifier
 * - nameTH: Thai menu name
 * - nameEN: English menu name
 * - description: Menu description
 * - price: Menu price (converted from Decimal)
 * - categoryId: Category ID
 * - category: Optional category information
 * - imageUrl: Menu image URL
 * - isRecommended: Recommended flag
 * - isAvailable: Availability flag
 * - isVisible: Visibility flag (for soft delete)
 * 
 * Property descriptions (CategoryDto):
 * - id: Unique category identifier
 * - name: Category name
 * - menus: Optional array of menus in this category
 * 
 * Transformation logic:
 * - Converts Prisma Decimal to number
 * - Prevents circular references in nested relations
 * - Filters deletedAt for security
 * 
 * @module dtos/menuDto
 * @requires @prisma/client
 * 
 * @see {@link ../controllers/menuController.ts} for usage
 * @see {@link ../controllers/categoryController.ts} for usage
 */

import type { Menu, Category } from '@prisma/client';

/**
 * Menu DTO (Data Transfer Object)
 * 
 * Controls what menu data is exposed through the API.
 * Includes category relation when loaded.
 * 
 * @example
 * const menuDto = MenuDto.fromPrisma(menuWithCategory);
 * res.json({ status: 'success', data: menuDto });
 */
export class MenuDto {
  id: number;
  nameTH: string;
  nameEN: string;
  description: string;
  price: number;
  categoryId: number;
  category?: CategoryDto;
  imageUrl: string;
  isRecommended: boolean;
  isAvailable: boolean;
  isVisible: boolean;

  constructor(menu: Menu & { category?: Category | null }) {
    this.id = menu.id;
    this.nameTH = menu.nameTH;
    this.nameEN = menu.nameEN;
    this.description = menu.description || '';
    // Convert Prisma Decimal to number
    this.price = Number(menu.price);
    this.categoryId = menu.categoryId;
    this.imageUrl = menu.imageUrl || '';
    this.isRecommended = menu.isRecommended;
    this.isAvailable = menu.isAvailable;
    this.isVisible = menu.isVisible;

    // Include category if present
    if (menu.category) {
      this.category = new CategoryDto(menu.category);
    }

    // SECURITY: deletedAt is NOT exposed
  }

  /**
   * Convert single Prisma Menu to DTO
   */
  static fromPrisma(menu: Menu & { category?: Category | null }): MenuDto {
    return new MenuDto(menu);
  }

  /**
   * Convert array of Prisma Menus to DTOs
   */
  static fromPrismaMany(menus: (Menu & { category?: Category | null })[]): MenuDto[] {
    return menus.map(menu => new MenuDto(menu));
  }
}

/**
 * Category DTO (Data Transfer Object)
 * 
 * Controls what category data is exposed through the API.
 * Includes menus array when loaded (prevents circular reference).
 * 
 * @example
 * const categoryDto = CategoryDto.fromPrisma(categoryWithMenus);
 * res.json({ status: 'success', data: categoryDto });
 */
export class CategoryDto {
  id: number;
  name: string;
  menus?: MenuDto[];

  constructor(category: Category & { menus?: Menu[] }) {
    this.id = category.id;
    this.name = category.name;

    // Include menus if present (avoid circular reference by not including category in nested menus)
    if (category.menus) {
      this.menus = category.menus.map(menu => ({
        id: menu.id,
        nameTH: menu.nameTH,
        nameEN: menu.nameEN,
        description: menu.description || '',
        price: Number(menu.price),
        categoryId: menu.categoryId,
        imageUrl: menu.imageUrl || '',
        isRecommended: menu.isRecommended,
        isAvailable: menu.isAvailable,
        isVisible: menu.isVisible
      }));
    }
  }

  /**
   * Convert single Prisma Category to DTO
   */
  static fromPrisma(category: Category & { menus?: Menu[] }): CategoryDto {
    return new CategoryDto(category);
  }

  /**
   * Convert array of Prisma Categories to DTOs
   */
  static fromPrismaMany(categories: (Category & { menus?: Menu[] })[]): CategoryDto[] {
    return categories.map(cat => new CategoryDto(cat));
  }
}
