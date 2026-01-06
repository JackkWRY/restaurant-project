/**
 * @file Order Item Repository
 * @description Data access layer for order item-related database operations
 * 
 * This repository handles:
 * - Individual order item queries
 * - Item status updates
 * - Relation loading for bill calculations
 * 
 * Database schema:
 * - OrderItem: id, orderId, menuId, quantity, status, note
 * - Relations: menu (N:1), order (N:1)
 * 
 * Performance considerations:
 * - Always loads menu relation for price calculations
 * - Loads order.table for status broadcasting
 * 
 * @module repositories/orderItemRepository
 * @requires @prisma/client
 * @requires prisma
 * @requires config/enums
 * 
 * @see {@link ../services/orderService.ts} for business logic
 */

import prisma from '../client/prisma.js';
import type { OrderItem, Prisma } from '@prisma/client';
import { OrderStatus } from '../../core/config/enums.js';

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
   * Updates an order item
   * 
   * Generic update method for any order item field.
   * 
   * @param id - Order item ID
   * @param data - Prisma order item update data
   * @returns Updated order item with menu, order, and table
   * 
   * @example
   * await orderItemRepository.update(itemId, {
   *   quantity: 3,
   *   note: "Extra spicy"
   * });
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
