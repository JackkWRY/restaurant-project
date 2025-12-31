import { billRepository } from '../repositories/billRepository.js';
import { tableRepository } from '../repositories/tableRepository.js';
import { NotFoundError } from '../errors/AppError.js';
import { BillDto } from '../dtos/billDto.js';
import { OrderStatus, BillStatus } from '../config/enums.js';

interface CheckoutInput {
  tableId: number;
  paymentMethod: string;
}

/**
 * Bill Service
 * Handles all business logic related to bills
 */
export class BillService {
  /**
   * Get table bill
   */
  async getTableBill(tableId: number) {
    const activeBill = await billRepository.findActiveBillByTable(
      tableId,
      BillStatus.OPEN
    );

    if (!activeBill) {
      return {
        billId: null,
        tableId,
        items: [],
        totalAmount: 0
      };
    }

    const { total, items } = this.calculateBillData(activeBill.orders);

    return {
      billId: activeBill.id,
      tableId: activeBill.tableId,
      items,
      totalAmount: total
    };
  }

  /**
   * Checkout table
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

    // Update bill
    await billRepository.update(activeBill.id, {
      status: BillStatus.PAID,
      closedAt: new Date(),
      totalPrice: total,
      paymentMethod: data.paymentMethod
    });

    // Update table
    await tableRepository.update(data.tableId, {
      isOccupied: false,
      isCallingStaff: false
    });

    return { message: 'Bill closed successfully' };
  }

  /**
   * Calculate bill data
   */
  private calculateBillData(orders: any[]) {
    let total = 0;
    const items: any[] = [];

    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const itemTotal = Number(item.menu.price) * item.quantity;

        items.push({
          id: item.id,
          menuName: item.menu.nameTH,
          price: Number(item.menu.price),
          quantity: item.quantity,
          status: item.status,
          total: itemTotal,
          note: item.note || ''
        });

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
