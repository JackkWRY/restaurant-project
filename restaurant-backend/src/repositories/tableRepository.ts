/**
 * @file Table Repository
 * @description Data access layer for table-related database operations
 * 
 * @module repositories/tableRepository
 * @requires @prisma/client
 * @requires prisma
 * @see {@link ../services/tableService.ts}
 */

import prisma from '../prisma.js';
import type { Table, Prisma } from '@prisma/client';

export class TableRepository {
  /**
   * Retrieves all tables with optional filtering
   * 
   * Performance: Simple query, indexed by id for efficient sorting.
   * 
   * @param where - Optional Prisma where clause
   * @returns Array of tables ordered by ID
   */
  async findAll(where?: Prisma.TableWhereInput) {
    // Order by ID for consistent table numbering display
    return await prisma.table.findMany({
      where,
      orderBy: { id: 'asc' }
    });
  }

  /**
   * Retrieves a single table by ID
   * 
   * Performance: Uses primary key for O(1) lookup.
   * 
   * @param id - Table ID
   * @returns Table or null if not found
   */
  async findById(id: number) {
    // Primary key lookup - fastest query type
    return await prisma.table.findUnique({
      where: { id }
    });
  }

  /**
   * Retrieves a table by name (unique constraint)
   * 
   * Validation: Used for uniqueness checks before create/update.
   * Performance: Requires unique index on name column.
   * 
   * @param name - Table name
   * @returns Table or null if not found
   */
  async findByName(name: string) {
    // Unique constraint check - requires unique index on 'name'
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
