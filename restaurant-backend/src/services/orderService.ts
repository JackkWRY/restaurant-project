/**
 * @file Order Service
 * @description Business logic layer for order management
 * 
 * This service handles:
 * - Order creation with database transactions
 * - Price calculation and validation
 * - Bill management and updates
 * - Order status transitions
 * - Item-level status management
 * 
 * Key features:
 * - Atomic transactions for data consistency
 * - Server-side price calculation (prevents client manipulation)
 * - Automatic bill creation and updates
 * - Race condition prevention using Prisma increment
 * 
 * @module services/orderService
 * @requires prisma
 * @requires repositories/orderRepository
 * @requires repositories/billRepository
 * @requires repositories/tableRepository
 * @requires repositories/menuRepository
 * 
 * @see {@link ../controllers/orderController.ts} for HTTP handlers
 * @see {@link ../repositories/orderRepository.ts} for data access
 */

import prisma from "../prisma.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { billRepository } from "../repositories/billRepository.js";
import { tableRepository } from "../repositories/tableRepository.js";
import { menuRepository } from "../repositories/menuRepository.js";
import { orderItemRepository } from "../repositories/orderItemRepository.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../errors/AppError.js";
import { OrderDto } from "../dtos/orderDto.js";
import { OrderStatus, BillStatus } from "../config/enums.js";

interface CreateOrderInput {
  tableId: number;
  items: Array<{
    menuId: number;
    quantity: number;
    note?: string;
  }>;
}

export class OrderService {
  /**
   * Creates a new order with multiple items in a database transaction
   *
   * Workflow:
   * 1. Validates table exists and is available
   * 2. Calculates order total from menu prices
   * 3. Finds or creates active bill for the table
   * 4. Creates order and order items
   * 5. Updates table occupation status
   *
   * @param data - Order data with tableId and items array
   * @returns Created order with all items and bill information
   * @throws {NotFoundError} If table or menu items don't exist
   * @throws {ValidationError} If table is not available
   */
  async createOrder(data: CreateOrderInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate table
      const table = await tx.table.findUnique({ where: { id: data.tableId } });
      if (!table) {
        throw new NotFoundError("Table");
      }
      if (!table.isAvailable) {
        throw new ValidationError("Table is not available");
      }

      // 2. Calculate total from menu prices
      // We calculate here instead of trusting client to prevent price manipulation
      let orderTotal = 0;
      for (const item of data.items) {
        const menu = await tx.menu.findUnique({ where: { id: item.menuId } });
        if (!menu) {
          throw new NotFoundError(`Menu with ID ${item.menuId}`);
        }
        orderTotal += Number(menu.price) * item.quantity;
      }

      // 3. Find or create active bill for this table
      // Each table can only have one OPEN bill at a time
      let activeBill = await tx.bill.findFirst({
        where: {
          tableId: data.tableId,
          status: BillStatus.OPEN,
        },
      });

      if (!activeBill) {
        // Create new bill with initial total of 0
        // Total will be updated after order creation
        activeBill = await tx.bill.create({
          data: {
            tableId: data.tableId,
            status: BillStatus.OPEN,
            totalPrice: 0,
          },
        });
      }

      // 4. Create order
      const order = await tx.order.create({
        data: {
          tableId: data.tableId,
          totalPrice: orderTotal,
          status: OrderStatus.PENDING,
          billId: activeBill.id,
          items: {
            create: data.items.map((item) => ({
              menuId: item.menuId,
              quantity: item.quantity,
              note: item.note || "",
              status: OrderStatus.PENDING,
            })),
          },
        },
        include: {
          items: { include: { menu: true } },
          table: true,
        },
      });

      // 5. Update bill total using increment to avoid race conditions
      // Multiple orders can be created simultaneously for the same table
      await tx.bill.update({
        where: { id: activeBill.id },
        data: {
          totalPrice: { increment: orderTotal },
        },
      });

      // 6. Mark table as occupied
      await tx.table.update({
        where: { id: data.tableId },
        data: { isOccupied: true },
      });

      return order;
    });
  }

  /**
   * Retrieves all active orders
   * 
   * Returns orders that are not completed or cancelled.
   * Used by staff and kitchen dashboards for real-time order tracking.
   * 
   * @returns Array of active orders with items and table information
   * @throws {Error} If database query fails
   * 
   * @example
   * const activeOrders = await orderService.getActiveOrders();
   */
  async getActiveOrders() {
    const orders = await orderRepository.findActiveOrders([
      OrderStatus.PENDING,
      OrderStatus.COOKING,
      OrderStatus.READY,
    ]);

    // Filter out orders with no items
    const validOrders = orders.filter((order) => order.items.length > 0);

    return validOrders;
  }

  /**
   * Updates order status
   * 
   * Changes the status of an entire order (affects all items).
   * Status transitions: PENDING → COOKING → READY → SERVED → COMPLETED
   * 
   * @param id - Order ID
   * @param status - New status from OrderStatus enum
   * @returns Updated order with DTO transformation
   * @throws {NotFoundError} If order doesn't exist
   * 
   * @example
   * await orderService.updateOrderStatus(1, OrderStatus.COOKING);
   */
  async updateOrderStatus(id: number, status: OrderStatus) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order");
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        // Update all non-cancelled items to match order status
        // Cancelled items remain cancelled
        items: {
          updateMany: {
            where: { status: { not: "CANCELLED" } },
            data: { status },
          },
        },
      },
      include: {
        items: { include: { menu: true } },
        table: true,
      },
    });

    // Recalculate bill if exists
    if (updatedOrder.billId) {
      await this.recalculateBill(updatedOrder.billId);
    }

    return updatedOrder;
  }

  /**
   * Updates individual order item status
   * 
   * Allows granular control over each dish in an order.
   * Automatically recalculates bill total when status changes.
   * 
   * @param itemId - Order item ID
   * @param status - New status from OrderStatus enum
   * @returns Updated order item with full relations
   * @throws {NotFoundError} If order item doesn't exist
   * 
   * @example
   * // Mark specific dish as ready
   * await orderService.updateOrderItemStatus(5, OrderStatus.READY);
   * 
   * @example
   * // Cancel a dish (automatically updates bill)
   * await orderService.updateOrderItemStatus(5, OrderStatus.CANCELLED);
   */
  async updateOrderItemStatus(itemId: number, status: OrderStatus) {
    const item = await orderItemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundError("Order item");
    }

    const updatedItem = await orderItemRepository.updateStatus(itemId, status);

    // Recalculate bill if exists
    if (updatedItem.order && updatedItem.order.billId) {
      await this.recalculateBill(updatedItem.order.billId);
    }

    return updatedItem;
  }

  /**
   * Recalculate bill total
   */
  private async recalculateBill(billId: string) {
    const bill = await billRepository.findById(billId);
    if (!bill) return;

    // Recalculate total by summing all non-cancelled items
    // This ensures bill total is always accurate after status changes
    let newTotal = 0;
    bill.orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.status !== OrderStatus.CANCELLED) {
          newTotal += Number(item.menu.price) * item.quantity;
        }
      });
    });

    await billRepository.update(billId, {
      totalPrice: newTotal,
    });
  }
}

// Export singleton instance
export const orderService = new OrderService();
