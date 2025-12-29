import prisma from '../prisma.js';
import type { Menu, Prisma } from '@prisma/client';

/**
 * Menu Repository
 * Handles all database operations for Menu model
 */
export class MenuRepository {
  /**
   * Find all menus with optional filters
   */
  async findAll(filters?: Prisma.MenuWhereInput) {
    return await prisma.menu.findMany({
      where: filters,
      include: { category: true },
      orderBy: { id: 'desc' }
    });
  }

  /**
   * Find menus with pagination
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
   * Find menu by ID
   */
  async findById(id: number) {
    return await prisma.menu.findUnique({
      where: { id },
      include: { category: true }
    });
  }

  /**
   * Create new menu
   */
  async create(data: Prisma.MenuCreateInput) {
    return await prisma.menu.create({
      data,
      include: { category: true }
    });
  }

  /**
   * Update menu
   */
  async update(id: number, data: Prisma.MenuUpdateInput) {
    return await prisma.menu.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  /**
   * Delete menu (hard delete)
   */
  async delete(id: number) {
    return await prisma.menu.delete({
      where: { id }
    });
  }

  /**
   * Soft delete menu
   */
  async softDelete(id: number) {
    return await prisma.menu.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Count menus
   */
  async count(where?: Prisma.MenuWhereInput) {
    return await prisma.menu.count({ where });
  }
}

// Export singleton instance
export const menuRepository = new MenuRepository();
