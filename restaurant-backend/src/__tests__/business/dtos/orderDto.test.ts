/**
 * @file Order DTO Tests
 * @description Unit tests for Order and OrderItem DTOs
 * 
 * Tests cover:
 * - OrderDto transformation from Prisma
 * - OrderItemDto transformation from Prisma
 * - Field mapping and type conversion
 * - Decimal to number conversion
 * - Nested relations (table, items, menu)
 * - Null handling
 * 
 * Best Practices:
 * - Test data transformation
 * - Test type conversions
 * - Test nested DTOs
 * - Test optional fields
 */

import { describe, it, expect } from 'vitest';
import { OrderDto, OrderItemDto } from '@/business/dtos/orderDto';
import { createMockOrder, createMockOrderItem, createMockTable, createMockMenu } from '@/__tests__/helpers/testData';
import { Decimal } from '@prisma/client/runtime/library';

describe('OrderItemDto', () => {
  describe('fromPrisma', () => {
    it('should transform Prisma OrderItem to OrderItemDto', () => {
      // Arrange
      const mockItem = createMockOrderItem({
        id: 1,
        orderId: 10,
        menuId: 5,
        quantity: 2,
        note: 'No spicy',
        status: 'PENDING',
      });

      // Act
      const result = OrderItemDto.fromPrisma(mockItem);

      // Assert
      expect(result).toBeInstanceOf(OrderItemDto);
      expect(result.id).toBe(1);
      expect(result.orderId).toBe(10);
      expect(result.menuId).toBe(5);
      expect(result.quantity).toBe(2);
      expect(result.note).toBe('No spicy');
      expect(result.status).toBe('PENDING');
    });

    it('should handle null note', () => {
      // Arrange
      const mockItem = createMockOrderItem({
        note: null as any,
      });

      // Act
      const result = OrderItemDto.fromPrisma(mockItem);

      // Assert
      expect(result.note).toBeNull();
    });

    it('should include menu when present', () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 5, nameTH: 'ข้าวผัด' });
      const mockItem = {
        ...createMockOrderItem({ menuId: 5 }),
        menu: mockMenu,
      };

      // Act
      const result = OrderItemDto.fromPrisma(mockItem);

      // Assert
      expect(result.menu).toBeDefined();
      expect(result.menu?.id).toBe(5);
      expect(result.menu?.nameTH).toBe('ข้าวผัด');
    });

    it('should not include menu when not present', () => {
      // Arrange
      const mockItem = createMockOrderItem();

      // Act
      const result = OrderItemDto.fromPrisma(mockItem);

      // Assert
      expect(result.menu).toBeUndefined();
    });
  });

  describe('fromPrismaMany', () => {
    it('should transform array of Prisma OrderItems to OrderItemDtos', () => {
      // Arrange
      const mockItems = [
        createMockOrderItem({ id: 1, quantity: 2 }),
        createMockOrderItem({ id: 2, quantity: 1 }),
      ];

      // Act
      const result = OrderItemDto.fromPrismaMany(mockItems);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(OrderItemDto);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should handle empty array', () => {
      // Arrange
      const mockItems: any[] = [];

      // Act
      const result = OrderItemDto.fromPrismaMany(mockItems);

      // Assert
      expect(result).toEqual([]);
    });
  });
});

describe('OrderDto', () => {
  describe('fromPrisma', () => {
    it('should transform Prisma Order to OrderDto', () => {
      // Arrange
      const mockOrder = createMockOrder({
        id: 1,
        tableId: 5,
        billId: 'bill-uuid-1',
        status: 'PENDING',
        totalPrice: new Decimal(150),
      });

      // Act
      const result = OrderDto.fromPrisma(mockOrder);

      // Assert
      expect(result).toBeInstanceOf(OrderDto);
      expect(result.id).toBe(1);
      expect(result.tableId).toBe(5);
      expect(result.billId).toBe('bill-uuid-1');
      expect(result.status).toBe('PENDING');
      expect(result.totalPrice).toBe(150);
    });

    it('should convert Decimal totalPrice to number', () => {
      // Arrange
      const mockOrder = createMockOrder({
        totalPrice: new Decimal(299.99),
      });

      // Act
      const result = OrderDto.fromPrisma(mockOrder);

      // Assert
      expect(typeof result.totalPrice).toBe('number');
      expect(result.totalPrice).toBe(299.99);
    });

    it('should handle null billId', () => {
      // Arrange
      const mockOrder = createMockOrder({
        billId: null,
      });

      // Act
      const result = OrderDto.fromPrisma(mockOrder);

      // Assert
      expect(result.billId).toBeNull();
    });

    it('should include createdAt date', () => {
      // Arrange
      const createdDate = new Date('2024-01-01');
      const mockOrder = createMockOrder({
        createdAt: createdDate,
      });

      // Act
      const result = OrderDto.fromPrisma(mockOrder);

      // Assert
      expect(result.createdAt).toEqual(createdDate);
    });

    it('should include table when present', () => {
      // Arrange
      const mockTable = createMockTable({ id: 5, name: 'A5' });
      const mockOrder = {
        ...createMockOrder({ tableId: 5 }),
        table: mockTable,
      };

      // Act
      const result = OrderDto.fromPrisma(mockOrder);

      // Assert
      expect(result.table).toBeDefined();
      expect(result.table?.id).toBe(5);
      expect(result.table?.name).toBe('A5');
    });

    it('should not include table when not present', () => {
      // Arrange
      const mockOrder = createMockOrder();

      // Act
      const result = OrderDto.fromPrisma(mockOrder);

      // Assert
      expect(result.table).toBeUndefined();
    });

    it('should include items when present', () => {
      // Arrange
      const mockItems = [
        createMockOrderItem({ id: 1 }),
        createMockOrderItem({ id: 2 }),
      ];

      const mockOrder = {
        ...createMockOrder(),
        items: mockItems,
      };

      // Act
      const result = OrderDto.fromPrisma(mockOrder);

      // Assert
      expect(result.items).toBeDefined();
      expect(result.items).toHaveLength(2);
      expect(result.items![0]).toBeInstanceOf(OrderItemDto);
    });

    it('should not include items when not present', () => {
      // Arrange
      const mockOrder = createMockOrder();

      // Act
      const result = OrderDto.fromPrisma(mockOrder);

      // Assert
      expect(result.items).toBeUndefined();
    });
  });

  describe('fromPrismaMany', () => {
    it('should transform array of Prisma Orders to OrderDtos', () => {
      // Arrange
      const mockOrders = [
        createMockOrder({ id: 1, tableId: 1 }),
        createMockOrder({ id: 2, tableId: 2 }),
      ];

      // Act
      const result = OrderDto.fromPrismaMany(mockOrders);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(OrderDto);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should handle empty array', () => {
      // Arrange
      const mockOrders: any[] = [];

      // Act
      const result = OrderDto.fromPrismaMany(mockOrders);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
