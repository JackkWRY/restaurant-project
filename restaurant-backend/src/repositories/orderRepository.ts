/**
 * @file Order Repository
 * @description Data access layer for order-related database operations
 * 
 * @module repositories/orderRepository
 * @requires @prisma/client
 * @requires prisma
 * @see {@link ../services/orderService.ts}
 */

import prisma from '../prisma.js';
import type { Order, OrderItem, Prisma } from '@prisma/client';
import { OrderStatus } from '../config/enums.js';

export class OrderRepository {
  /**
   * Retrieves all orders with optional filtering
   * 
   * Includes related items with menu details and table information.
   * Performance: Uses eager loading to avoid N+1 queries.
   * 
   * @param where - Optional Prisma where clause for filtering
   * @returns Array of orders with items and table
   */
  async findAll(where?: Prisma.OrderWhereInput) {
    // Eager load relations to prevent N+1 query problem
    // - items.menu: Required for displaying order contents with prices
    // - table: Required for table identification and status
    return await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { menu: true }
        },
        table: true
      },
      // Oldest orders first (FIFO for kitchen queue)
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Retrieves a single order by ID
   * 
   * Performance: Single query with eager loading.
   * 
   * @param id - Order ID
   * @returns Order with items and table, or null if not found
   */
  async findById(id: number) {
    // Include all relations for complete order details
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { menu: true }
        },
        table: true
      }
    });
  }

  /**
   * Creates a new order
   * 
   * Validation: Relies on database constraints and service layer validation.
   * 
   * @param data - Prisma order creation data
   * @returns Created order with items and table
   */
  async create(data: Prisma.OrderCreateInput) {
    // Return created order with full relations for immediate use
    return await prisma.order.create({
      data,
      include: {
        items: {
          include: { menu: true }
        },
        table: true
      }
    });
  }

  /**
   * Updates an existing order
   * 
   * Performance: Single update query with eager loading.
   * 
   * @param id - Order ID
   * @param data - Prisma order update data
   * @returns Updated order with items and table
   */
  async update(id: number, data: Prisma.OrderUpdateInput) {
    // Return updated order with relations for consistency
    return await prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: { menu: true }
        },
        table: true
      }
    });
  }

  /**
   * Deletes an order
   * 
   * @param id - Order ID
   * @returns Deleted order
   */
  async delete(id: number) {
    return await prisma.order.delete({
      where: { id }
    });
  }

  /**
   * Retrieves active orders by status
   * 
   * Excludes cancelled items from results.
   * 
   * @param statuses - Array of order statuses to filter
   * @returns Array of active orders with non-cancelled items
   */
  async findActiveOrders(statuses: OrderStatus[]) {
    return await prisma.order.findMany({
      where: {
        status: { in: statuses }
      },
      include: {
        items: {
          where: { status: { not: 'CANCELLED' } },
          include: { menu: true }
        },
        table: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}

// Export singleton instance
export const orderRepository = new OrderRepository();
