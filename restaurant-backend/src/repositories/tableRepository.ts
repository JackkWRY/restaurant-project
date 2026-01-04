import prisma from '../prisma.js';
import type { Table, Prisma } from '@prisma/client';

/**
 * Table Repository
 * Handles all database operations for Table model
 */
export class TableRepository {
  /**
   * Retrieves all tables with optional filtering
   * 
   * @param where - Optional Prisma where clause
   * @returns Array of tables ordered by ID
   */
  async findAll(where?: Prisma.TableWhereInput) {
    return await prisma.table.findMany({
      where,
      orderBy: { id: 'asc' }
    });
  }

  /**
   * Retrieves a single table by ID
   * 
   * @param id - Table ID
   * @returns Table or null if not found
   */
  async findById(id: number) {
    return await prisma.table.findUnique({
      where: { id }
    });
  }

  /**
   * Retrieves a table by name (unique constraint)
   * 
   * @param name - Table name
   * @returns Table or null if not found
   */
  async findByName(name: string) {
    return await prisma.table.findUnique({
      where: { name }
    });
  }

  /**
   * Creates a new table
   * 
   * @param data - Prisma table creation data
   * @returns Created table
   */
  async create(data: Prisma.TableCreateInput) {
    return await prisma.table.create({
      data
    });
  }

  /**
   * Updates an existing table
   * 
   * @param id - Table ID
   * @param data - Prisma table update data
   * @returns Updated table
   */
  async update(id: number, data: Prisma.TableUpdateInput) {
    return await prisma.table.update({
      where: { id },
      data
    });
  }

  /**
   * Deletes a table
   * 
   * @param id - Table ID
   * @returns Deleted table
   */
  async delete(id: number) {
    return await prisma.table.delete({
      where: { id }
    });
  }

  /**
   * Updates table occupied status
   * 
   * @param id - Table ID
   * @param isOccupied - New occupied status
   * @returns Updated table
   */
  async updateOccupiedStatus(id: number, isOccupied: boolean) {
    return await prisma.table.update({
      where: { id },
      data: { isOccupied }
    });
  }

  /**
   * Updates call staff status
   * 
   * @param id - Table ID
   * @param isCallingStaff - New call staff status
   * @returns Updated table
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
