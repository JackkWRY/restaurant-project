/**
 * @file Bill Service
 * @description Business logic layer for bill management
 * 
 * This service handles:
 * - Bill retrieval for tables
 * - Bill calculation excluding cancelled items
 * - Table checkout workflow
 * - Payment processing
 * - Table status reset after payment
 * 
 * Workflow:
 * 1. Find active bill for table
 * 2. Calculate total from non-cancelled items
 * 3. Update bill status to PAID
 * 4. Reset table to available state
 * 
 * @module services/billService
 * @requires repositories/billRepository
 * @requires repositories/tableRepository
 * @requires errors/AppError
 * @requires dtos/billDto
 * @requires config/enums
 * 
 * @see {@link ../controllers/billController.ts} for HTTP handlers
 */

import { billRepository } from '../../database/repositories/billRepository.js';
import { tableRepository } from '../../database/repositories/tableRepository.js';
import { NotFoundError } from '../../core/errors/AppError.js';
import { BillDto } from '../dtos/billDto.js';
import { OrderStatus, BillStatus } from '../../core/config/enums.js';
import type { Order, OrderItem, Menu } from '@prisma/client';

// Type for orders with relations
type OrderWithRelations = Order & {
  items: (OrderItem & { menu: Menu })[];
};

// Type for bill item
interface BillItem {
  id: number;
  menuName: string;
  price: number;
  quantity: number;
  status: string;
  total: number;
  note: string;
}

interface CheckoutInput {
  tableId: number;
  paymentMethod: string;
}

export class BillService {
  /**
   * Retrieves the current bill for a table
   * 
   * Returns bill with all items and calculated total.
   * Returns empty bill structure if no active bill exists.
   * 
   * @param tableId - Table ID
   * @returns Bill data with items and total amount
   * @throws {Error} If database query fails
   */
  async getTableBill(tableId: number) {
    const activeBill = await billRepository.findActiveBillByTable(
      tableId,
      BillStatus.OPEN
    );

    // Return empty bill structure if no active bill exists
    // This allows frontend to display "No orders yet" state
    if (!activeBill) {
      return {
        billId: null,
        tableId,
        items: [],
        totalAmount: 0
      };
    }

    // Calculate current bill total from all orders
    // This provides real-time bill preview to customers and staff
    const { total, items } = this.calculateBillData(activeBill.orders);

    return {
      billId: activeBill.id,
      tableId: activeBill.tableId,
      items,
      totalAmount: total
    };
  }

  /**
   * Processes table checkout and closes the bill
   * 
   * Workflow:
   * 1. Finds active bill
   * 2. Calculates final total
   * 3. Updates bill status to PAID
   * 4. Resets table status
   * 
   * @param data - Checkout data with tableId and paymentMethod
   * @returns Success message
   * @throws {NotFoundError} If no active bill exists
   * @throws {Error} If database operation fails
   * 
   * @example
   * await billService.checkoutTable({
   *   tableId: 1,
   *   paymentMethod: "cash"
   * });
   */
  async checkoutTable(data: CheckoutInput) {
    const activeBill = await billRepository.findActiveBillByTable(
      data.tableId,
      BillStatus.OPEN
    );

    if (!activeBill) {
      throw new NotFoundError('Active bill');
    }

    const { total } = this.calculateBillData(activeBill.orders);

    // Close the bill and record payment
    await billRepository.update(activeBill.id, {
      status: BillStatus.PAID,
      closedAt: new Date(),
      totalPrice: total,
      paymentMethod: data.paymentMethod
    });

    // Reset table to available state for next customers
    await tableRepository.update(data.tableId, {
      isOccupied: false,
      isCallingStaff: false
    });

    return { message: 'Bill closed successfully' };
  }

  /**
   * Calculates bill total and formats items
   * 
   * Excludes cancelled items from total calculation.
   * 
   * @param orders - Orders with items and menu relations
   * @returns Calculated total and formatted items array
   * @private
   */
  private calculateBillData(orders: OrderWithRelations[]) {
    let total = 0;
    const items: BillItem[] = [];

    orders.forEach(order => {
      order.items.forEach((item) => {
        const itemTotal = Number(item.menu.price) * item.quantity;

        // Add all items to the list for display purposes
        items.push({
          id: item.id,
          menuName: item.menu.nameTH,
          price: Number(item.menu.price),
          quantity: item.quantity,
          status: item.status,
          total: itemTotal,
          note: item.note || ''
        });

        // Only include non-cancelled items in total calculation
        // Cancelled items are shown but not charged
        if (item.status !== OrderStatus.CANCELLED) {
          total += itemTotal;
        }
      });
    });

    return { total, items };
  }
}

// Export singleton instance
export const billService = new BillService();
