/**
 * @file Bill DTO Tests
 * @description Unit tests for Bill DTOs
 * 
 * Tests cover:
 * - BillDto transformation from Prisma
 * - Field mapping and type conversion
 * - Decimal to number conversion
 * - Nested relations (table, orders)
 * - Date handling
 * - Null handling
 * 
 * Best Practices:
 * - Test data transformation
 * - Test type conversions
 * - Test nested DTOs
 * - Test optional fields
 */

import { describe, it, expect } from 'vitest';
import { BillDto } from '@/business/dtos/billDto';
import { createMockBill, createMockTable, createMockOrder } from '@/__tests__/helpers/testData';
import { Decimal } from '@prisma/client/runtime/library';

describe('BillDto', () => {
  describe('fromPrisma', () => {
    it('should transform Prisma Bill to BillDto', () => {
      // Arrange
      const mockBill = createMockBill({
        id: 'bill-uuid-1',
        tableId: 1,
        totalPrice: new Decimal(250),
        paymentMethod: 'CASH',
        status: 'OPEN',
      });

      // Act
      const result = BillDto.fromPrisma(mockBill);

      // Assert
      expect(result).toBeInstanceOf(BillDto);
      expect(result.id).toBe('bill-uuid-1');
      expect(result.tableId).toBe(1);
      expect(result.totalPrice).toBe(250);
      expect(result.paymentMethod).toBe('CASH');
      expect(result.status).toBe('OPEN');
    });

    it('should convert Decimal totalPrice to number', () => {
      // Arrange
      const mockBill = createMockBill({
        totalPrice: new Decimal(199.99),
      });

      // Act
      const result = BillDto.fromPrisma(mockBill);

      // Assert
      expect(typeof result.totalPrice).toBe('number');
      expect(result.totalPrice).toBe(199.99);
    });

    it('should handle null paymentMethod', () => {
      // Arrange
      const mockBill = createMockBill({
        paymentMethod: null,
      });

      // Act
      const result = BillDto.fromPrisma(mockBill);

      // Assert
      expect(result.paymentMethod).toBeNull();
    });

    it('should handle null closedAt for open bills', () => {
      // Arrange
      const mockBill = createMockBill({
        status: 'OPEN',
        closedAt: null as any,
      });

      // Act
      const result = BillDto.fromPrisma(mockBill);

      // Assert
      expect(result.closedAt).toBeNull();
    });

    it('should include createdAt and updatedAt dates', () => {
      // Arrange
      const createdDate = new Date('2024-01-01');
      const updatedDate = new Date('2024-01-02');
      const mockBill = createMockBill({
        createdAt: createdDate,
        updatedAt: updatedDate,
      });

      // Act
      const result = BillDto.fromPrisma(mockBill);

      // Assert
      expect(result.createdAt).toEqual(createdDate);
      expect(result.updatedAt).toEqual(updatedDate);
    });

    it('should include table when present', () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, name: 'A1' });
      const mockBill = {
        ...createMockBill({ tableId: 1 }),
        table: mockTable,
      };

      // Act
      const result = BillDto.fromPrisma(mockBill);

      // Assert
      expect(result.table).toBeDefined();
      expect(result.table?.id).toBe(1);
      expect(result.table?.name).toBe('A1');
    });

    it('should not include table when not present', () => {
      // Arrange
      const mockBill = createMockBill();

      // Act
      const result = BillDto.fromPrisma(mockBill);

      // Assert
      expect(result.table).toBeUndefined();
    });

    it('should include orders when present', () => {
      // Arrange
      const mockOrders = [
        createMockOrder({ id: 1 }),
        createMockOrder({ id: 2 }),
      ];

      const mockBill = {
        ...createMockBill(),
        orders: mockOrders,
      };

      // Act
      const result = BillDto.fromPrisma(mockBill);

      // Assert
      expect(result.orders).toBeDefined();
      expect(result.orders).toHaveLength(2);
    });

    it('should not include orders when not present', () => {
      // Arrange
      const mockBill = createMockBill();

      // Act
      const result = BillDto.fromPrisma(mockBill);

      // Assert
      expect(result.orders).toBeUndefined();
    });
  });

  describe('fromPrismaMany', () => {
    it('should transform array of Prisma Bills to BillDtos', () => {
      // Arrange
      const mockBills = [
        createMockBill({ id: 'bill-1', tableId: 1 }),
        createMockBill({ id: 'bill-2', tableId: 2 }),
      ];

      // Act
      const result = BillDto.fromPrismaMany(mockBills);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(BillDto);
      expect(result[0].id).toBe('bill-1');
      expect(result[1].id).toBe('bill-2');
    });

    it('should handle empty array', () => {
      // Arrange
      const mockBills: any[] = [];

      // Act
      const result = BillDto.fromPrismaMany(mockBills);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
