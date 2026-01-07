/**
 * @file Bill Service Tests
 * @description Unit tests for bill management business logic
 * 
 * Tests cover:
 * - getTableBill with active/no bills
 * - checkoutTable workflow
 * - Bill calculation excluding cancelled items
 * - Table status reset after checkout
 * - Error handling
 * 
 * Best Practices:
 * - Mock repository methods
 * - Test business logic
 * - Test calculations
 * - Test error conditions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { billService } from '@/business/services/billService';
import { createMockBill, createMockOrder, createMockOrderItem, createMockMenu } from '@/__tests__/helpers/testData';
import { NotFoundError } from '@/core/errors/AppError';
import { BillStatus, OrderStatus } from '@/core/config/enums';
import { Decimal } from '@prisma/client/runtime/library';

// Mock repositories
vi.mock('@/database/repositories/billRepository', () => ({
  billRepository: {
    findActiveBillByTable: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/database/repositories/tableRepository', () => ({
  tableRepository: {
    update: vi.fn(),
  },
}));

import { billRepository } from '@/database/repositories/billRepository';
import { tableRepository } from '@/database/repositories/tableRepository';

describe('BillService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTableBill', () => {
    it('should return bill with items for active bill', async () => {
      // Arrange
      const mockMenu1 = createMockMenu({ id: 1, nameTH: 'ข้าวผัด', price: new Decimal(50) });
      const mockMenu2 = createMockMenu({ id: 2, nameTH: 'ผัดไทย', price: new Decimal(60) });
      
      const mockOrderItems = [
        { ...createMockOrderItem({ id: 1, menuId: 1, quantity: 2, status: OrderStatus.PENDING }), menu: mockMenu1 },
        { ...createMockOrderItem({ id: 2, menuId: 2, quantity: 1, status: OrderStatus.PENDING }), menu: mockMenu2 },
      ];

      const mockOrder = {
        ...createMockOrder({ id: 1 }),
        items: mockOrderItems,
      };

      const mockBill = {
        ...createMockBill({ id: '1', tableId: 1, status: BillStatus.OPEN }),
        orders: [mockOrder],
      };

      vi.mocked(billRepository.findActiveBillByTable).mockResolvedValue(mockBill as any);

      // Act
      const result = await billService.getTableBill(1);

      // Assert
      expect(billRepository.findActiveBillByTable).toHaveBeenCalledWith(1, BillStatus.OPEN);
      expect(result).toHaveProperty('billId', '1');
      expect(result).toHaveProperty('tableId', 1);
      expect(result.items).toHaveLength(2);
      expect(result.totalAmount).toBe(160); // (50*2) + (60*1)
    });

    it('should return empty bill structure if no active bill exists', async () => {
      // Arrange
      vi.mocked(billRepository.findActiveBillByTable).mockResolvedValue(null);

      // Act
      const result = await billService.getTableBill(1);

      // Assert
      expect(result).toEqual({
        billId: null,
        tableId: 1,
        items: [],
        totalAmount: 0,
      });
    });

    it('should exclude cancelled items from total', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1, nameTH: 'ข้าวผัด', price: new Decimal(50) });
      
      const mockOrderItems = [
        { ...createMockOrderItem({ id: 1, quantity: 2, status: OrderStatus.PENDING }), menu: mockMenu },
        { ...createMockOrderItem({ id: 2, quantity: 1, status: OrderStatus.CANCELLED }), menu: mockMenu },
      ];

      const mockOrder = {
        ...createMockOrder({ id: 1 }),
        items: mockOrderItems,
      };

      const mockBill = {
        ...createMockBill({ id: '1', tableId: 1 }),
        orders: [mockOrder],
      };

      vi.mocked(billRepository.findActiveBillByTable).mockResolvedValue(mockBill as any);

      // Act
      const result = await billService.getTableBill(1);

      // Assert
      expect(result.items).toHaveLength(2); // Both items shown
      expect(result.totalAmount).toBe(100); // Only non-cancelled: 50*2
    });

    it('should handle multiple orders in one bill', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1, price: new Decimal(50) });
      
      const mockOrder1 = {
        ...createMockOrder({ id: 1 }),
        items: [{ ...createMockOrderItem({ quantity: 1 }), menu: mockMenu }],
      };

      const mockOrder2 = {
        ...createMockOrder({ id: 2 }),
        items: [{ ...createMockOrderItem({ quantity: 2 }), menu: mockMenu }],
      };

      const mockBill = {
        ...createMockBill({ id: '1', tableId: 1 }),
        orders: [mockOrder1, mockOrder2],
      };

      vi.mocked(billRepository.findActiveBillByTable).mockResolvedValue(mockBill as any);

      // Act
      const result = await billService.getTableBill(1);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.totalAmount).toBe(150); // (50*1) + (50*2)
    });
  });

  describe('checkoutTable', () => {
    it('should checkout table successfully', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1, price: new Decimal(100) });
      const mockOrderItems = [
        { ...createMockOrderItem({ quantity: 2 }), menu: mockMenu },
      ];

      const mockOrder = {
        ...createMockOrder({ id: 1 }),
        items: mockOrderItems,
      };

      const mockBill = {
        ...createMockBill({ id: '1', tableId: 1, status: BillStatus.OPEN }),
        orders: [mockOrder],
      };

      vi.mocked(billRepository.findActiveBillByTable).mockResolvedValue(mockBill as any);
      vi.mocked(billRepository.update).mockResolvedValue(mockBill as any);
      vi.mocked(tableRepository.update).mockResolvedValue({} as any);

      // Act
      const result = await billService.checkoutTable({
        tableId: 1,
        paymentMethod: 'CASH',
      });

      // Assert
      expect(billRepository.findActiveBillByTable).toHaveBeenCalledWith(1, BillStatus.OPEN);
      expect(billRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({
        status: BillStatus.PAID,
        totalPrice: 200,
        paymentMethod: 'CASH',
      }));
      expect(tableRepository.update).toHaveBeenCalledWith(1, {
        isOccupied: false,
        isCallingStaff: false,
      });
      expect(result).toEqual({ message: 'Bill closed successfully' });
    });

    it('should throw NotFoundError if no active bill exists', async () => {
      // Arrange
      vi.mocked(billRepository.findActiveBillByTable).mockResolvedValue(null);

      // Act & Assert
      await expect(billService.checkoutTable({
        tableId: 1,
        paymentMethod: 'CASH',
      })).rejects.toThrow(NotFoundError);
      await expect(billService.checkoutTable({
        tableId: 1,
        paymentMethod: 'CASH',
      })).rejects.toThrow('Active bill not found');
    });

    it('should calculate correct total excluding cancelled items', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1, price: new Decimal(50) });
      const mockOrderItems = [
        { ...createMockOrderItem({ quantity: 3, status: OrderStatus.PENDING }), menu: mockMenu },
        { ...createMockOrderItem({ quantity: 2, status: OrderStatus.CANCELLED }), menu: mockMenu },
      ];

      const mockOrder = {
        ...createMockOrder({ id: 1 }),
        items: mockOrderItems,
      };

      const mockBill = {
        ...createMockBill({ id: '1', tableId: 1 }),
        orders: [mockOrder],
      };

      vi.mocked(billRepository.findActiveBillByTable).mockResolvedValue(mockBill as any);
      vi.mocked(billRepository.update).mockResolvedValue(mockBill as any);
      vi.mocked(tableRepository.update).mockResolvedValue({} as any);

      // Act
      await billService.checkoutTable({
        tableId: 1,
        paymentMethod: 'CARD',
      });

      // Assert
      expect(billRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({
        totalPrice: 150, // Only 3 items: 50*3, cancelled items excluded
      }));
    });

    it('should reset table status after checkout', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1, price: new Decimal(50) });
      const mockOrder = {
        ...createMockOrder({ id: 1 }),
        items: [{ ...createMockOrderItem({ quantity: 1 }), menu: mockMenu }],
      };

      const mockBill = {
        ...createMockBill({ id: '1', tableId: 5 }),
        orders: [mockOrder],
      };

      vi.mocked(billRepository.findActiveBillByTable).mockResolvedValue(mockBill as any);
      vi.mocked(billRepository.update).mockResolvedValue(mockBill as any);
      vi.mocked(tableRepository.update).mockResolvedValue({} as any);

      // Act
      await billService.checkoutTable({
        tableId: 5,
        paymentMethod: 'CASH',
      });

      // Assert
      expect(tableRepository.update).toHaveBeenCalledWith(5, {
        isOccupied: false,
        isCallingStaff: false,
      });
    });

    it('should handle different payment methods', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1, price: new Decimal(100) });
      const mockOrder = {
        ...createMockOrder({ id: 1 }),
        items: [{ ...createMockOrderItem({ quantity: 1 }), menu: mockMenu }],
      };

      const mockBill = {
        ...createMockBill({ id: '1', tableId: 1 }),
        orders: [mockOrder],
      };

      vi.mocked(billRepository.findActiveBillByTable).mockResolvedValue(mockBill as any);
      vi.mocked(billRepository.update).mockResolvedValue(mockBill as any);
      vi.mocked(tableRepository.update).mockResolvedValue({} as any);

      // Act
      await billService.checkoutTable({
        tableId: 1,
        paymentMethod: 'PROMPTPAY',
      });

      // Assert
      expect(billRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({
        paymentMethod: 'PROMPTPAY',
      }));
    });
  });
});
