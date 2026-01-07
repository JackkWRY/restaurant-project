/**
 * @file Test Data Factories
 * @description Factory functions for creating test data
 * 
 * Provides utilities to generate realistic test data for various entities.
 * 
 * Usage:
 * ```typescript
 * import { createMockMenu, createMockOrder } from '@/__tests__/helpers/testData';
 * 
 * const menu = createMockMenu({ price: 100 });
 * const order = createMockOrder({ status: 'PENDING' });
 * ```
 * 
 * Best Practices:
 * - Use realistic data
 * - Allow overrides for flexibility
 * - Keep data minimal but valid
 * - Match actual Prisma schema
 */

import { Menu, Category, Order, Table, Bill, User, OrderItem } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Create a mock Menu item
 */
export function createMockMenu(overrides: Partial<Menu> = {}): Menu & { category: { id: number; name: string } } {
  return {
    id: 1,
    nameTH: 'ข้าวผัด',
    nameEN: 'Fried Rice',
    description: 'Delicious fried rice',
    price: new Decimal(50),
    imageUrl: 'https://example.com/image.jpg',
    isRecommended: false,
    isAvailable: true,
    isVisible: true,
    categoryId: 1,
    deletedAt: null,
    category: {
      id: 1,
      name: 'Main Dishes',
    },
    ...overrides,
  } as Menu & { category: { id: number; name: string } };
}

/**
 * Create a mock Category
 */
export function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1,
    name: 'Main Dishes',
    ...overrides,
  };
}

/**
 * Create a mock Order
 */
export function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1,
    tableId: 1,
    totalPrice: new Decimal(150),
    status: 'PENDING',
    createdAt: new Date(),
    billId: null,
    ...overrides,
  };
}

/**
 * Create a mock Table
 */
export function createMockTable(overrides: Partial<Table> = {}): Table {
  return {
    id: 1,
    name: 'Table 1',
    qrCode: null,
    isOccupied: false,
    isAvailable: true,
    isCallingStaff: false,
    ...overrides,
  };
}

/**
 * Create a mock Bill
 */
export function createMockBill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: 'bill-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    closedAt: new Date(),
    status: 'OPEN',
    totalPrice: new Decimal(150),
    paymentMethod: 'CASH',
    tableId: 1,
    ...overrides,
  };
}

/**
 * Create a mock User
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    role: 'ADMIN',
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock OrderItem
 */
export function createMockOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 1,
    orderId: 1,
    menuId: 1,
    quantity: 1,
    status: 'PENDING',
    note: '',
    ...overrides,
  };
}

/**
 * Create multiple items using a factory function
 */
export function createMany<T>(factory: (index: number) => T, count: number): T[] {
  return Array.from({ length: count }, (_, i) => factory(i));
}
