import prisma from '../prisma.js';
import type { Menu, Prisma } from '@prisma/client';

/**
 * Menu Repository
 * Handles all database operations for Menu model
 */
export class MenuRepository {
  /**
   * Retrieves all menus with optional filtering
   * 
   * Includes category information.
   * 
   * @param filters - Optional Prisma where clause
   * @returns Array of menus with category, ordered by ID descending
   */
  async findAll(filters?: Prisma.MenuWhereInput) {
    return await prisma.menu.findMany({
      where: filters,
      include: { category: true },
      orderBy: { id: 'desc' }
    });
  }

  /**
   * Retrieves menus with pagination support
   * 
   * @param options - Pagination options with where, skip, and take
   * @returns Object with menus array and total count
   */
  async findManyPaginated(options: {
    where?: Prisma.MenuWhereInput;
    skip: number;
    take: number;
  }) {
    const { where, skip, take } = options;
    
    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        include: { category: true },
        orderBy: { id: 'desc' },
        skip,
        take
      }),
      prisma.menu.count({ where })
    ]);

    return { menus, total };
  }

  /**
   * Retrieves a single menu by ID
   * 
   * @param id - Menu ID
   * @returns Menu with category, or null if not found
   */
  async findById(id: number) {
    return await prisma.menu.findUnique({
      where: { id },
      include: { category: true }
    });
  }

  /**
   * Creates a new menu
   * 
   * @param data - Prisma menu creation data
   * @returns Created menu with category
   */
  async create(data: Prisma.MenuCreateInput) {
    return await prisma.menu.create({
      data,
      include: { category: true }
    });
  }

  /**
   * Updates an existing menu
   * 
   * @param id - Menu ID
   * @param data - Prisma menu update data
   * @returns Updated menu with category
   */
  async update(id: number, data: Prisma.MenuUpdateInput) {
    return await prisma.menu.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  /**
   * Permanently deletes a menu
   * 
   * @param id - Menu ID
   * @returns Deleted menu
   */
  async delete(id: number) {
    return await prisma.menu.delete({
      where: { id }
    });
  }

  /**
   * Soft deletes a menu by setting deletedAt timestamp
   * 
   * @param id - Menu ID
   * @returns Updated menu with deletedAt set
   */
  async softDelete(id: number) {
    return await prisma.menu.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Counts menus with optional filtering
   * 
   * @param where - Optional Prisma where clause
   * @returns Total count of menus
   */
  async count(where?: Prisma.MenuWhereInput) {
    return await prisma.menu.count({ where });
  }
}

// Export singleton instance
export const menuRepository = new MenuRepository();
