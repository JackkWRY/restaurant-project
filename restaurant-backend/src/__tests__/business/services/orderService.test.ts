/**
 * @file Order Service Tests
 * @description Unit tests for order business logic
 * 
 * Tests cover:
 * - createOrder with transactions and validations
 * - getActiveOrders filtering
 * - updateOrderStatus with item updates
 * - updateOrderItemStatus with bill recalculation
 * - Bill management and recalculation
 * - Error handling and edge cases
 * 
 * Best Practices:
 * - Mock Prisma transactions
 * - Test business logic thoroughly
 * - Test error conditions
 * - Test bill calculations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { orderService } from '@/business/services/orderService';
import { createMockOrder, createMockTable, createMockMenu, createMockBill, createMockOrderItem } from '@/__tests__/helpers/testData';
import { NotFoundError, ValidationError } from '@/core/errors/AppError';
import { OrderStatus, BillStatus } from '@/core/config/enums';
import { Decimal } from '@prisma/client/runtime/library';

// Mock Prisma client
vi.mock('@/database/client/prisma', () => ({
  default: {
    $transaction: vi.fn(),
    order: {
      update: vi.fn(),
    },
  },
}));

// Mock repositories
vi.mock('@/database/repositories/orderRepository', () => ({
  orderRepository: {
    findActiveOrders: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock('@/database/repositories/billRepository', () => ({
  billRepository: {
    findById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/database/repositories/orderItemRepository', () => ({
  orderItemRepository: {
    findById: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

import prisma from '@/database/client/prisma';
import { orderRepository } from '@/database/repositories/orderRepository';
import { billRepository } from '@/database/repositories/billRepository';
import { orderItemRepository } from '@/database/repositories/orderItemRepository';

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order with items successfully', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isAvailable: true });
      const mockMenu1 = createMockMenu({ id: 1, price: new Decimal(50) });
      const mockMenu2 = createMockMenu({ id: 2, price: new Decimal(100) });
      const mockBill = createMockBill({ id: '1', status: BillStatus.OPEN, tableId: 1 });
      const mockOrder = createMockOrder({
        id: 1,
        tableId: 1,
        totalPrice: new Decimal(200),
        status: OrderStatus.PENDING,
      });

      const createData = {
        tableId: 1,
        items: [
          { menuId: 1, quantity: 2, note: 'No spicy' },
          { menuId: 2, quantity: 1 },
        ],
      };

      // Mock transaction
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          table: {
            findUnique: vi.fn().mockResolvedValue(mockTable),
            update: vi.fn(),
          },
          menu: {
            findUnique: vi.fn()
              .mockResolvedValueOnce(mockMenu1)
              .mockResolvedValueOnce(mockMenu2),
          },
          bill: {
            findFirst: vi.fn().mockResolvedValue(mockBill),
            update: vi.fn(),
          },
          order: {
            create: vi.fn().mockResolvedValue(mockOrder),
          },
        };
        return callback(tx);
      });

      // Act
      const result = await orderService.createOrder(createData);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('totalPrice');
    });

    it('should throw NotFoundError if table does not exist', async () => {
      // Arrange
      const createData = {
        tableId: 999,
        items: [{ menuId: 1, quantity: 1 }],
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          table: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        };
        return callback(tx);
      });

      // Act & Assert
      await expect(orderService.createOrder(createData)).rejects.toThrow(NotFoundError);
      await expect(orderService.createOrder(createData)).rejects.toThrow('Table not found');
    });

    it('should throw ValidationError if table is not available', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isAvailable: false });
      const createData = {
        tableId: 1,
        items: [{ menuId: 1, quantity: 1 }],
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          table: {
            findUnique: vi.fn().mockResolvedValue(mockTable),
          },
        };
        return callback(tx);
      });

      // Act & Assert
      await expect(orderService.createOrder(createData)).rejects.toThrow(ValidationError);
      await expect(orderService.createOrder(createData)).rejects.toThrow('Table is not available');
    });

    it('should throw NotFoundError if menu item does not exist', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isAvailable: true });
      const createData = {
        tableId: 1,
        items: [{ menuId: 999, quantity: 1 }],
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          table: {
            findUnique: vi.fn().mockResolvedValue(mockTable),
          },
          menu: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        };
        return callback(tx);
      });

      // Act & Assert
      await expect(orderService.createOrder(createData)).rejects.toThrow(NotFoundError);
    });

    it('should create new bill if no active bill exists', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isAvailable: true });
      const mockMenu = createMockMenu({ id: 1, price: new Decimal(50) });
      const mockBill = createMockBill({ id: '1', status: BillStatus.OPEN });
      const mockOrder = createMockOrder({ id: 1 });

      const createData = {
        tableId: 1,
        items: [{ menuId: 1, quantity: 1 }],
      };

      const billCreateSpy = vi.fn().mockResolvedValue(mockBill);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          table: {
            findUnique: vi.fn().mockResolvedValue(mockTable),
            update: vi.fn(),
          },
          menu: {
            findUnique: vi.fn().mockResolvedValue(mockMenu),
          },
          bill: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: billCreateSpy,
            update: vi.fn(),
          },
          order: {
            create: vi.fn().mockResolvedValue(mockOrder),
          },
        };
        return callback(tx);
      });

      // Act
      await orderService.createOrder(createData);

      // Assert
      expect(billCreateSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tableId: 1,
          status: BillStatus.OPEN,
          totalPrice: 0,
        }),
      });
    });

    it('should calculate order total from menu prices', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isAvailable: true });
      const mockMenu = createMockMenu({ id: 1, price: new Decimal(50) });
      const mockBill = createMockBill({ id: '1' });
      const mockOrder = createMockOrder({ id: 1 });

      const createData = {
        tableId: 1,
        items: [
          { menuId: 1, quantity: 3 }, // 50 * 3 = 150
        ],
      };

      const orderCreateSpy = vi.fn().mockResolvedValue(mockOrder);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          table: {
            findUnique: vi.fn().mockResolvedValue(mockTable),
            update: vi.fn(),
          },
          menu: {
            findUnique: vi.fn().mockResolvedValue(mockMenu),
          },
          bill: {
            findFirst: vi.fn().mockResolvedValue(mockBill),
            update: vi.fn(),
          },
          order: {
            create: orderCreateSpy,
          },
        };
        return callback(tx);
      });

      // Act
      await orderService.createOrder(createData);

      // Assert
      expect(orderCreateSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalPrice: 150,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('getActiveOrders', () => {
    it('should return active orders with items', async () => {
      // Arrange
      const mockOrders = [
        { ...createMockOrder({ id: 1, status: OrderStatus.PENDING }), items: [createMockOrderItem()] },
        { ...createMockOrder({ id: 2, status: OrderStatus.COOKING }), items: [createMockOrderItem()] },
      ];

      vi.mocked(orderRepository.findActiveOrders).mockResolvedValue(mockOrders as any);

      // Act
      const result = await orderService.getActiveOrders();

      // Assert
      expect(orderRepository.findActiveOrders).toHaveBeenCalledWith([
        OrderStatus.PENDING,
        OrderStatus.COOKING,
        OrderStatus.READY,
      ]);
      expect(result).toHaveLength(2);
    });

    it('should filter out orders with no items', async () => {
      // Arrange
      const mockOrders = [
        { ...createMockOrder({ id: 1 }), items: [createMockOrderItem()] },
        { ...createMockOrder({ id: 2 }), items: [] }, // Empty items
      ];

      vi.mocked(orderRepository.findActiveOrders).mockResolvedValue(mockOrders as any);

      // Act
      const result = await orderService.getActiveOrders();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      // Arrange
      const mockOrder = createMockOrder({ id: 1, status: OrderStatus.PENDING });
      const updatedOrder = createMockOrder({ id: 1, status: OrderStatus.COOKING });

      vi.mocked(orderRepository.findById).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue(updatedOrder as any);

      // Act
      const result = await orderService.updateOrderStatus(1, OrderStatus.COOKING);

      // Assert
      expect(orderRepository.findById).toHaveBeenCalledWith(1);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: OrderStatus.COOKING,
        }),
        include: expect.any(Object),
      });
      expect(result).toHaveProperty('status', OrderStatus.COOKING);
    });

    it('should throw NotFoundError if order does not exist', async () => {
      // Arrange
      vi.mocked(orderRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(orderService.updateOrderStatus(999, OrderStatus.COOKING)).rejects.toThrow(NotFoundError);
    });

    it('should update all non-cancelled items', async () => {
      // Arrange
      const mockOrder = createMockOrder({ id: 1 });
      const updatedOrder = createMockOrder({ id: 1 });

      vi.mocked(orderRepository.findById).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue(updatedOrder as any);

      // Act
      await orderService.updateOrderStatus(1, OrderStatus.READY);

      // Assert
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          items: {
            updateMany: {
              where: { status: { not: 'CANCELLED' } },
              data: { status: OrderStatus.READY },
            },
          },
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('updateOrderItemStatus', () => {
    it('should update order item status successfully', async () => {
      // Arrange
      const mockItem = createMockOrderItem({ id: 1, status: OrderStatus.PENDING });
      const updatedItem = createMockOrderItem({ id: 1, status: OrderStatus.READY });

      vi.mocked(orderItemRepository.findById).mockResolvedValue(mockItem as any);
      vi.mocked(orderItemRepository.updateStatus).mockResolvedValue(updatedItem as any);

      // Act
      const result = await orderService.updateOrderItemStatus(1, OrderStatus.READY);

      // Assert
      expect(orderItemRepository.findById).toHaveBeenCalledWith(1);
      expect(orderItemRepository.updateStatus).toHaveBeenCalledWith(1, OrderStatus.READY);
      expect(result).toHaveProperty('status', OrderStatus.READY);
    });

    it('should throw NotFoundError if order item does not exist', async () => {
      // Arrange
      vi.mocked(orderItemRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(orderService.updateOrderItemStatus(999, OrderStatus.READY)).rejects.toThrow(NotFoundError);
    });
  });
});
