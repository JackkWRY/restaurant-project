import type { Order, OrderItem, Menu } from '@prisma/client';
import { TableDto } from './tableDto.js';
import { MenuDto } from './menuDto.js';

/**
 * OrderItem DTO
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

    if (item.menu) {
      this.menu = MenuDto.fromPrisma(item.menu);
    }
  }

  static fromPrisma(item: OrderItem & { menu?: Menu }): OrderItemDto {
    return new OrderItemDto(item);
  }

  static fromPrismaMany(items: (OrderItem & { menu?: Menu })[]): OrderItemDto[] {
    return items.map(item => new OrderItemDto(item));
  }
}

/**
 * Order DTO
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

  constructor(order: Order & { table?: any; items?: (OrderItem & { menu?: Menu })[] }) {
    this.id = order.id;
    this.tableId = order.tableId;
    this.billId = order.billId;
    this.status = order.status;
    this.totalPrice = Number(order.totalPrice);
    this.createdAt = order.createdAt;

    if (order.table) {
      this.table = TableDto.fromPrisma(order.table);
    }

    if (order.items) {
      this.items = OrderItemDto.fromPrismaMany(order.items);
    }
  }

  static fromPrisma(order: Order & { table?: any; items?: (OrderItem & { menu?: Menu })[] }): OrderDto {
    return new OrderDto(order);
  }

  static fromPrismaMany(orders: (Order & { table?: any; items?: (OrderItem & { menu?: Menu })[] })[]): OrderDto[] {
    return orders.map(order => new OrderDto(order));
  }
}
