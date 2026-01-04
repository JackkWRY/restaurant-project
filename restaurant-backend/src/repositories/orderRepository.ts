import prisma from '../prisma.js';
import type { Order, OrderItem, Prisma } from '@prisma/client';
import { OrderStatus } from '../config/enums.js';

/**
 * Order Repository
 * Handles all database operations for Order model
 */
export class OrderRepository {
  /**
   * Retrieves all orders with optional filtering
   * 
   * Includes related items with menu details and table information.
   * 
   * @param where - Optional Prisma where clause for filtering
   * @returns Array of orders with items and table
   */
  async findAll(where?: Prisma.OrderWhereInput) {
    return await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { menu: true }
        },
        table: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Retrieves a single order by ID
   * 
   * @param id - Order ID
   * @returns Order with items and table, or null if not found
   */
  async findById(id: number) {
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
   * @param data - Prisma order creation data
   * @returns Created order with items and table
   */
  async create(data: Prisma.OrderCreateInput) {
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
   * @param id - Order ID
   * @param data - Prisma order update data
   * @returns Updated order with items and table
   */
  async update(id: number, data: Prisma.OrderUpdateInput) {
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
