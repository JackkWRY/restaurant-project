import prisma from '../prisma.js';
import type { Order, OrderItem, Prisma } from '@prisma/client';

/**
 * Order Repository
 * Handles all database operations for Order model
 */
export class OrderRepository {
  /**
   * Find all orders with filters
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
   * Find order by ID
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
   * Create order
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
   * Update order
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
   * Delete order
   */
  async delete(id: number) {
    return await prisma.order.delete({
      where: { id }
    });
  }

  /**
   * Find active orders
   */
  async findActiveOrders(statuses: any[]) {
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
