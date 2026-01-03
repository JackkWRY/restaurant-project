import prisma from '../prisma.js';
import type { OrderItem, Prisma } from '@prisma/client';
import { OrderStatus } from '../config/enums.js';

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
  async updateStatus(id: number, status: OrderStatus) {
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
