import prisma from '../prisma.js';
import type { OrderItem, Prisma } from '@prisma/client';

/**
 * OrderItem Repository
 * Handles all database operations for OrderItem model
 */
export class OrderItemRepository {
  /**
   * Find order item by ID
   */
  async findById(id: number) {
    return await prisma.orderItem.findUnique({
      where: { id },
      include: {
        menu: true,
        order: {
          include: { table: true }
        }
      }
    });
  }

  /**
   * Update order item
   */
  async update(id: number, data: Prisma.OrderItemUpdateInput) {
    return await prisma.orderItem.update({
      where: { id },
      data,
      include: {
        menu: true,
        order: {
          include: { table: true }
        }
      }
    });
  }

  /**
   * Update order item status
   */
  async updateStatus(id: number, status: any) {
    return await prisma.orderItem.update({
      where: { id },
      data: { status },
      include: {
        menu: true,
        order: {
          include: { table: true }
        }
      }
    });
  }
}

// Export singleton instance
export const orderItemRepository = new OrderItemRepository();
