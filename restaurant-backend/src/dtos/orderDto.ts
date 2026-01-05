/**
 * @file Order Data Transfer Objects
 * @description DTOs for order and order item-related API responses
 * 
 * This file provides:
 * - OrderDto: Complete order information with items and table
 * - OrderItemDto: Individual order item with menu details
 * - Transformation from Prisma models
 * - Nested DTO composition
 * 
 * Property descriptions (OrderDto):
 * - id: Unique order identifier
 * - tableId: Associated table ID
 * - table: Optional table information
 * - billId: Associated bill ID (null if not billed yet)
 * - status: Order status (PENDING, COOKING, READY, SERVED, etc.)
 * - totalPrice: Total order amount (converted from Decimal)
 * - items: Optional array of order items
 * - createdAt: Order creation timestamp
 * 
 * Property descriptions (OrderItemDto):
 * - id: Unique order item identifier
 * - orderId: Parent order ID
 * - menuId: Menu item ID
 * - menu: Optional menu information
 * - quantity: Item quantity
 * - note: Customer note/special request
 * - status: Item status (for kitchen tracking)
 * 
 * Transformation logic:
 * - Converts Prisma Decimal to number
 * - Recursively transforms nested relations
 * 
 * @module dtos/orderDto
 * @requires @prisma/client
 * @requires dtos/tableDto
 * @requires dtos/menuDto
 * 
 * @see {@link ../controllers/orderController.ts} for usage
 * @see {@link ../services/orderService.ts} for business logic
 */

import type { Order, OrderItem, Menu, Table } from '@prisma/client';
import { TableDto } from './tableDto.js';
import { MenuDto } from './menuDto.js';

/**
 * OrderItem DTO (Data Transfer Object)
 * 
 * Controls what order item data is exposed through the API.
 * Includes menu relation when loaded.
 * 
 * @example
 * const itemDto = OrderItemDto.fromPrisma(itemWithMenu);
 */
export class OrderItemDto {
  id: number;
  orderId: number;
  menuId: number;
  menu?: MenuDto;
  quantity: number;
  note: string | null;
  status: string;

  constructor(item: OrderItem & { menu?: Menu }) {
    this.id = item.id;
    this.orderId = item.orderId;
    this.menuId = item.menuId;
    this.quantity = item.quantity;
    this.note = item.note;
    this.status = item.status;

    // Transform nested menu relation
    if (item.menu) {
      this.menu = MenuDto.fromPrisma(item.menu);
    }
  }

  /**
   * Convert single Prisma OrderItem to DTO
   */
  static fromPrisma(item: OrderItem & { menu?: Menu }): OrderItemDto {
    return new OrderItemDto(item);
  }

  /**
   * Convert array of Prisma OrderItems to DTOs
   */
  static fromPrismaMany(items: (OrderItem & { menu?: Menu })[]): OrderItemDto[] {
    return items.map(item => new OrderItemDto(item));
  }
}

/**
 * Order DTO (Data Transfer Object)
 * 
 * Controls what order data is exposed through the API.
 * Includes table and items relations when loaded.
 * 
 * @example
 * const orderDto = OrderDto.fromPrisma(orderWithRelations);
 * res.json({ status: 'success', data: orderDto });
 */
export class OrderDto {
  id: number;
  tableId: number;
  table?: TableDto;
  billId: string | null;
  status: string;
  totalPrice: number;
  items?: OrderItemDto[];
  createdAt: Date;

  constructor(order: Order & { table?: Table; items?: (OrderItem & { menu?: Menu })[] }) {
    this.id = order.id;
    this.tableId = order.tableId;
    this.billId = order.billId;
    this.status = order.status;
    // Convert Prisma Decimal to number
    this.totalPrice = Number(order.totalPrice);
    this.createdAt = order.createdAt;

    // Transform nested table relation
    if (order.table) {
      this.table = TableDto.fromPrisma(order.table);
    }

    // Transform nested items array
    if (order.items) {
      this.items = OrderItemDto.fromPrismaMany(order.items);
    }
  }

  /**
   * Convert single Prisma Order to DTO
   */
  static fromPrisma(order: Order & { table?: Table; items?: (OrderItem & { menu?: Menu })[] }): OrderDto {
    return new OrderDto(order);
  }

  /**
   * Convert array of Prisma Orders to DTOs
   */
  static fromPrismaMany(orders: (Order & { table?: Table; items?: (OrderItem & { menu?: Menu })[] })[]): OrderDto[] {
    return orders.map(order => new OrderDto(order));
  }
}
