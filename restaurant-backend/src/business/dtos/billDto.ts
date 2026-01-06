/**
 * @file Bill Data Transfer Objects
 * @description DTOs for bill-related API responses
 * 
 * This file provides:
 * - BillDto: Complete bill information with relations
 * - Transformation from Prisma models to API responses
 * - Decimal to number conversion for prices
 * - Nested DTO composition (table, orders)
 * 
 * Property descriptions:
 * - id: Unique bill identifier (UUID)
 * - tableId: Associated table ID
 * - table: Optional table information
 * - orders: Optional array of orders in this bill
 * - totalPrice: Total bill amount (converted from Decimal)
 * - paymentMethod: Payment method used (CASH, CARD, etc.)
 * - status: Bill status (OPEN, PAID, CANCELLED)
 * - createdAt: Bill creation timestamp
 * - updatedAt: Last update timestamp
 * - closedAt: Bill closure timestamp (null if still open)
 * 
 * Transformation logic:
 * - Converts Prisma Decimal to JavaScript number
 * - Recursively transforms nested relations
 * - Filters sensitive/internal fields
 * 
 * @module dtos/billDto
 * @requires @prisma/client
 * @requires dtos/tableDto
 * @requires dtos/orderDto
 * 
 * @see {@link ../controllers/billController.ts} for usage
 * @see {@link ../services/billService.ts} for business logic
 */

import type { Bill, Order, OrderItem, Menu, Table } from '@prisma/client';
import { TableDto } from './tableDto.js';
import { OrderDto } from './orderDto.js';

/**
 * Bill DTO (Data Transfer Object)
 * 
 * Controls what bill data is exposed through the API.
 * Includes table and orders relations when loaded.
 * 
 * @example
 * const billDto = BillDto.fromPrisma(billWithRelations);
 * res.json({ status: 'success', data: billDto });
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
    // Convert Prisma Decimal to number for JSON serialization
    this.totalPrice = Number(bill.totalPrice);
    this.paymentMethod = bill.paymentMethod;
    this.status = bill.status;
    this.createdAt = bill.createdAt;
    this.updatedAt = bill.updatedAt;
    this.closedAt = bill.closedAt;

    // Transform nested table relation
    if (bill.table) {
      this.table = TableDto.fromPrisma(bill.table);
    }

    // Transform nested orders array
    if (bill.orders) {
      this.orders = OrderDto.fromPrismaMany(bill.orders);
    }
  }

  /**
   * Convert single Prisma Bill to DTO
   */
  static fromPrisma(bill: Bill & { 
    table?: Table; 
    orders?: (Order & { items?: (OrderItem & { menu?: Menu })[] })[]
  }): BillDto {
    return new BillDto(bill);
  }

  /**
   * Convert array of Prisma Bills to DTOs
   */
  static fromPrismaMany(bills: (Bill & { 
    table?: Table; 
    orders?: (Order & { items?: (OrderItem & { menu?: Menu })[] })[]
  })[]): BillDto[] {
    return bills.map(bill => new BillDto(bill));
  }
}
