/**
 * @file Table Repository
 * @description Data access layer for table-related database operations
 * 
 * This repository handles:
 * - Table CRUD operations
 * - Table status management (occupied, available, calling staff)
 * - Name uniqueness validation
 * 
 * Database schema:
 * - Table: id, name (unique), qrCode, isOccupied, isAvailable, isCallingStaff
 * - Constraints: UNIQUE(name)
 * 
 * Performance considerations:
 * - Primary key lookups for O(1) access
 * - Unique index on name for fast duplicate checks
 * - Simple queries without relations
 * 
 * @module repositories/tableRepository
 * @requires @prisma/client
 * @requires prisma
 * 
 * @see {@link ../services/tableService.ts} for business logic
 */

import prisma from '../client/prisma.js';
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
   * Called when customers arrive or leave the table.
   * 
   * @param id - Table ID
   * @param isOccupied - New occupied status (true when customers seated)
   * @returns Updated table
   * 
   * @example
   * // Mark table as occupied when order is placed
   * await tableRepository.updateOccupiedStatus(tableId, true);
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
   * Used when customers request staff assistance.
   * Triggers real-time notifications to staff dashboard.
   * 
   * @param id - Table ID
   * @param isCallingStaff - New call staff status (true when customer calls)
   * @returns Updated table
   * 
   * @example
   * // Customer presses "Call Staff" button
   * await tableRepository.updateCallStaffStatus(tableId, true);
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
