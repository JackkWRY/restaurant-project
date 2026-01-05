/**
 * @file Bill Repository
 * @description Data access layer for bill-related database operations
 * 
 * This repository handles:
 * - Bill retrieval with full order and item relations
 * - Bill CRUD operations
 * - Active bill queries by table
 * - Atomic total price updates
 * 
 * Database schema:
 * - Bill: id (UUID), tableId, status, totalPrice, createdAt, closedAt
 * - Relations: table (1:1), orders (1:N)
 * 
 * Performance considerations:
 * - Uses eager loading to prevent N+1 queries
 * - Increment operations for race condition prevention
 * 
 * @module repositories/billRepository
 * @requires @prisma/client
 * @requires prisma
 * @requires config/enums
 * 
 * @see {@link ../services/billService.ts} for business logic
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
   * Creates a new bill for a table
   * 
   * @param data - Prisma bill creation data
   * @returns Created bill with table and orders
   * 
   * @example
   * const bill = await billRepository.create({
   *   tableId: 1,
   *   status: BillStatus.OPEN,
   *   totalPrice: 0
   * });
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
   * Updates an existing bill
   * 
   * Used for status changes and price updates.
   * 
   * @param id - Bill ID (UUID string)
   * @param data - Prisma bill update data
   * @returns Updated bill
   * 
   * @example
   * await billRepository.update(billId, {
   *   status: BillStatus.PAID,
   *   closedAt: new Date(),
   *   totalPrice: 150
   * });
   */
  async update(id: string, data: Prisma.BillUpdateInput) {
    return await prisma.bill.update({
      where: { id },
      data
    });
  }

  /**
   * Permanently deletes a bill
   * 
   * Warning: This is a hard delete. Use with caution.
   * 
   * @param id - Bill ID (UUID string)
   * @returns Deleted bill
   */
  async delete(id: string) {
    return await prisma.bill.delete({
      where: { id }
    });
  }

  /**
   * Atomically increments bill total price
   * 
   * Uses Prisma's increment operation to prevent race conditions
   * when multiple orders are added simultaneously.
   * 
   * @param id - Bill ID (UUID string)
   * @param amount - Amount to add to total
   * @returns Updated bill
   * 
   * @example
   * // Add new order total to bill
   * await billRepository.incrementTotal(billId, 50);
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
