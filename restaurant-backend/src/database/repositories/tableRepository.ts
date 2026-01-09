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
   * Retrieves all non-deleted tables with optional filtering
   * 
   * Performance: Simple query, indexed by id for efficient sorting.
   * Soft delete: Filters out tables where deletedAt is not null.
   * 
   * @param where - Optional Prisma where clause
   * @returns Array of active tables ordered by ID
   */
  async findAll(where?: Prisma.TableWhereInput) {
    // Order by ID for consistent table numbering display
    // Filter out soft-deleted tables
    return await prisma.table.findMany({
      where: {
        ...where,
        deletedAt: null
      },
      orderBy: { id: 'asc' }
    });
  }

  /**
   * Retrieves a single non-deleted table by ID
   * 
   * Performance: Uses primary key for O(1) lookup.
   * Soft delete: Returns null if table is deleted.
   * 
   * @param id - Table ID
   * @returns Table or null if not found or deleted
   */
  async findById(id: number) {
    // Primary key lookup with soft delete filter
    return await prisma.table.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    });
  }

  /**
   * Retrieves a non-deleted table by name
   * 
   * Validation: Used for uniqueness checks before create/update.
   * Soft delete: Only checks among non-deleted tables.
   * Performance: Requires unique index on name column.
   * 
   * @param name - Table name
   * @returns Table or null if not found or deleted
   */
  async findByName(name: string) {
    // Check uniqueness only among non-deleted tables
    return await prisma.table.findFirst({
      where: { 
        name,
        deletedAt: null
      }
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
   * Soft deletes a table by setting deletedAt timestamp
   * 
   * Preserves all related data (Bills, Orders) for analytics.
   * Table will be filtered out from all queries but data remains.
   * 
   * @param id - Table ID
   * @returns Soft deleted table
   */
  async softDelete(id: number) {
    return await prisma.table.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        isAvailable: false,
        isOccupied: false
      }
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
