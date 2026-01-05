/**
 * @file Order Item Repository
 * @description Data access layer for order item-related database operations
 * 
 * @module repositories/orderItemRepository
 * @requires @prisma/client
 * @requires prisma
 * @see {@link ../services/orderService.ts}
 */

import prisma from '../prisma.js';
import type { OrderItem, Prisma } from '@prisma/client';
import { OrderStatus } from '../config/enums.js';

export class OrderItemRepository {
  /**
   * Find order item by ID
   * 
   * Performance: Uses eager loading for all required relations.
   * 
   * @param id - Order item ID
   * @returns Order item with menu, order, and table, or null if not found
   */
  async findById(id: number) {
    // Include all relations needed for item status updates and bill calculations
    // - menu: For price and item details
    // - order.table: For table identification and status
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
   * 
   * Performance: Single update query with eager loading.
   * Validation: Status transitions handled by service layer.
   * 
   * @param id - Order item ID
   * @param status - New status from OrderStatus enum
   * @returns Updated order item with all relations
   */
  async updateStatus(id: number, status: OrderStatus) {
    // Return updated item with relations for bill recalculation
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
