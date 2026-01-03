import type { Bill, Order, OrderItem, Menu, Table } from '@prisma/client';
import { TableDto } from './tableDto.js';
import { OrderDto } from './orderDto.js';

/**
 * Bill DTO (Data Transfer Object)
 * Controls what bill data is exposed through the API
 */
export class BillDto {
  id: string;
  tableId: number;
  table?: TableDto;
  orders?: OrderDto[];
  totalPrice: number;
  paymentMethod: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;

  constructor(bill: Bill & { 
    table?: Table; 
    orders?: (Order & { items?: (OrderItem & { menu?: Menu })[] })[]
  }) {
    this.id = bill.id;
    this.tableId = bill.tableId;
    this.totalPrice = Number(bill.totalPrice);
    this.paymentMethod = bill.paymentMethod;
    this.status = bill.status;
    this.createdAt = bill.createdAt;
    this.updatedAt = bill.updatedAt;
    this.closedAt = bill.closedAt;

    if (bill.table) {
      this.table = TableDto.fromPrisma(bill.table);
    }

    if (bill.orders) {
      this.orders = OrderDto.fromPrismaMany(bill.orders);
    }
  }

  static fromPrisma(bill: Bill & { 
    table?: Table; 
    orders?: (Order & { items?: (OrderItem & { menu?: Menu })[] })[]
  }): BillDto {
    return new BillDto(bill);
  }

  static fromPrismaMany(bills: (Bill & { 
    table?: Table; 
    orders?: (Order & { items?: (OrderItem & { menu?: Menu })[] })[]
  })[]): BillDto[] {
    return bills.map(bill => new BillDto(bill));
  }
}
