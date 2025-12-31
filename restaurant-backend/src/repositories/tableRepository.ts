import prisma from '../prisma.js';
import type { Table, Prisma } from '@prisma/client';

/**
 * Table Repository
 * Handles all database operations for Table model
 */
export class TableRepository {
  /**
   * Find all tables
   */
  async findAll(where?: Prisma.TableWhereInput) {
    return await prisma.table.findMany({
      where,
      orderBy: { id: 'asc' }
    });
  }

  /**
   * Find table by ID
   */
  async findById(id: number) {
    return await prisma.table.findUnique({
      where: { id }
    });
  }

  /**
   * Find table by name
   */
  async findByName(name: string) {
    return await prisma.table.findUnique({
      where: { name }
    });
  }

  /**
   * Create table
   */
  async create(data: Prisma.TableCreateInput) {
    return await prisma.table.create({
      data
    });
  }

  /**
   * Update table
   */
  async update(id: number, data: Prisma.TableUpdateInput) {
    return await prisma.table.update({
      where: { id },
      data
    });
  }

  /**
   * Delete table
   */
  async delete(id: number) {
    return await prisma.table.delete({
      where: { id }
    });
  }

  /**
   * Update table occupied status
   */
  async updateOccupiedStatus(id: number, isOccupied: boolean) {
    return await prisma.table.update({
      where: { id },
      data: { isOccupied }
    });
  }

  /**
   * Update call staff status
   */
  async updateCallStaffStatus(id: number, isCallingStaff: boolean) {
    return await prisma.table.update({
      where: { id },
      data: { isCallingStaff }
    });
  }
}

// Export singleton instance
export const tableRepository = new TableRepository();
