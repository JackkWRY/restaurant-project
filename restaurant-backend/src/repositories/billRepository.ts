/**
 * @file Bill Repository
 * @description Data access layer for bill-related database operations
 * 
 * @module repositories/billRepository
 * @requires @prisma/client
 * @requires prisma
 * @see {@link ../services/billService.ts}
 */

import prisma from '../prisma.js';
import type { Bill, Prisma } from '@prisma/client';
import { BillStatus } from '../config/enums.js';

export class BillRepository {
  /**
   * Retrieves all bills with optional filtering
   * 
   * Includes table and orders with items.
   * Performance: Uses eager loading to avoid N+1 queries.
   * 
   * @param where - Optional Prisma where clause
   * @returns Array of bills with full relations
   */
  async findAll(where?: Prisma.BillWhereInput) {
    // Eager load all relations for complete bill details
    // - table: For table identification
    // - orders.items.menu: For bill item details and pricing
    return await prisma.bill.findMany({
      where,
      include: {
        table: true,
        orders: {
          include: {
            items: {
              include: { menu: true }
            }
          }
        }
      }
    });
  }

  /**
   * Retrieves a single bill by ID
   * 
   * @param id - Bill ID (string UUID)
   * @returns Bill with table and orders, or null if not found
   */
  async findById(id: string) {
    return await prisma.bill.findUnique({
      where: { id },
      include: {
        table: true,
        orders: {
          include: {
            items: {
              include: { menu: true }
            }
          }
        }
      }
    });
  }

  /**
   * Retrieves active bill for a specific table
   * 
   * @param tableId - Table ID
   * @param status - Bill status to filter
   * @returns Active bill or null if not found
   */
  async findActiveBillByTable(tableId: number, status: BillStatus) {
    return await prisma.bill.findFirst({
      where: {
        tableId,
        status
      },
      include: {
        table: true,
        orders: {
          include: {
            items: {
              include: { menu: true }
            }
          }
        }
      }
    });
  }

  /**
   * Create bill
   */
  async create(data: Prisma.BillCreateInput) {
    return await prisma.bill.create({
      data,
      include: {
        table: true,
        orders: true
      }
    });
  }

  /**
   * Update bill
   */
  async update(id: string, data: Prisma.BillUpdateInput) {
    return await prisma.bill.update({
      where: { id },
      data
    });
  }

  /**
   * Delete bill
   */
  async delete(id: string) {
    return await prisma.bill.delete({
      where: { id }
    });
  }

  /**
   * Increment bill total
   */
  async incrementTotal(id: string, amount: number) {
    return await prisma.bill.update({
      where: { id },
      data: {
        totalPrice: { increment: amount }
      }
    });
  }
}

// Export singleton instance
export const billRepository = new BillRepository();
