import prisma from '../prisma.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { billRepository } from '../repositories/billRepository.js';
import { tableRepository } from '../repositories/tableRepository.js';
import { menuRepository } from '../repositories/menuRepository.js';
import { orderItemRepository } from '../repositories/orderItemRepository.js';
import { NotFoundError, ValidationError, ConflictError } from '../errors/AppError.js';
import { OrderDto } from '../dtos/orderDto.js';
import { OrderStatus, BillStatus } from '../config/enums.js';

interface CreateOrderInput {
  tableId: number;
  items: Array<{
    menuId: number;
    quantity: number;
    note?: string;
  }>;
}

/**
 * Order Service
 * Handles all business logic related to orders
 */
export class OrderService {
  /**
   * Create new order
   */
  async createOrder(data: CreateOrderInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate table
      const table = await tx.table.findUnique({ where: { id: data.tableId } });
      if (!table) {
        throw new NotFoundError('Table');
      }
      if (!table.isAvailable) {
        throw new ValidationError('Table is not available');
      }

      // 2. Calculate total
      let orderTotal = 0;
      for (const item of data.items) {
        const menu = await tx.menu.findUnique({ where: { id: item.menuId } });
        if (!menu) {
          throw new NotFoundError(`Menu with ID ${item.menuId}`);
        }
        orderTotal += Number(menu.price) * item.quantity;
      }

      // 3. Find or create active bill
      let activeBill = await tx.bill.findFirst({
        where: {
          tableId: data.tableId,
          status: BillStatus.OPEN
        }
      });

      if (!activeBill) {
        activeBill = await tx.bill.create({
          data: {
            tableId: data.tableId,
            status: BillStatus.OPEN,
            totalPrice: 0
          }
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
            create: data.items.map(item => ({
              menuId: item.menuId,
              quantity: item.quantity,
              note: item.note || '',
              status: OrderStatus.PENDING
            }))
          }
        },
        include: {
          items: { include: { menu: true } },
          table: true
        }
      });

      // 5. Update bill total
      await tx.bill.update({
        where: { id: activeBill.id },
        data: {
          totalPrice: { increment: orderTotal }
        }
      });

      // 6. Mark table as occupied
      await tx.table.update({
        where: { id: data.tableId },
        data: { isOccupied: true }
      });

      return order;
    });
  }

  /**
   * Get active orders
   */
  async getActiveOrders() {
    const orders = await orderRepository.findActiveOrders([
      OrderStatus.PENDING,
      OrderStatus.COOKING,
      OrderStatus.READY
    ]);

    // Filter out orders with no items
    const validOrders = orders.filter(order => order.items.length > 0);

    return validOrders;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: number, status: any) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order');
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        items: {
          updateMany: {
            where: { status: { not: 'CANCELLED' } },
            data: { status }
          }
        }
      },
      include: {
        items: { include: { menu: true } },
        table: true
      }
    });

    // Recalculate bill if exists
    if (updatedOrder.billId) {
      await this.recalculateBill(updatedOrder.billId);
    }

    return updatedOrder;
  }

  /**
   * Update order item status
   */
  async updateOrderItemStatus(itemId: number, status: any) {
    const item = await orderItemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundError('Order item');
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

    let newTotal = 0;
    bill.orders.forEach(order => {
      order.items.forEach(item => {
        if (item.status !== OrderStatus.CANCELLED) {
          newTotal += Number(item.menu.price) * item.quantity;
        }
      });
    });

    await billRepository.update(billId, {
      totalPrice: newTotal
    });
  }
}

// Export singleton instance
export const orderService = new OrderService();
