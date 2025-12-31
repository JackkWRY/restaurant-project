import prisma from '../prisma.js';
import type { Bill, Prisma } from '@prisma/client';

/**
 * Bill Repository
 * Handles all database operations for Bill model
 */
export class BillRepository {
  /**
   * Find all bills
   */
  async findAll(where?: Prisma.BillWhereInput) {
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
   * Find bill by ID
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
   * Find active bill by table
   */
  async findActiveBillByTable(tableId: number, status: any) {
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
