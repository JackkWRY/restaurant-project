/**
 * @file Order Repository Tests
 * @description Unit tests for order data access layer
 * 
 * Tests cover:
 * - findAll() with relations
 * - findById() single retrieval
 * - create() order creation
 * - update() order updates
 * - delete() order deletion
 * - findActiveOrders() active orders by status
 * 
 * Best Practices:
 * - Mock Prisma client
 * - Test method calls
 * - Test query parameters
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { orderRepository } from '@/database/repositories/orderRepository';
import prisma from '@/database/client/prisma';
import { createMockOrder } from '@/__tests__/helpers/testData';
import { OrderStatus } from '@/core/config/enums';

// Mock Prisma client
vi.mock('@/database/client/prisma', () => ({
  default: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('OrderRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all orders with relations', async () => {
      // Arrange
      const mockOrders = [createMockOrder(), createMockOrder()];
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      // Act
      const result = await orderRepository.findAll();

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          items: {
            include: { menu: true }
          },
          table: true
        },
        orderBy: { createdAt: 'asc' }
      });
      expect(result).toEqual(mockOrders);
    });

    it('should find orders with filters', async () => {
      // Arrange
      const mockOrders = [createMockOrder()];
      const filters = { status: OrderStatus.PENDING };
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      // Act
      const result = await orderRepository.findAll(filters);

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: filters,
        include: expect.any(Object),
        orderBy: { createdAt: 'asc' }
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('findById', () => {
    it('should find order by id with relations', async () => {
      // Arrange
      const mockOrder = createMockOrder({ id: 1 });
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

      // Act
      const result = await orderRepository.findById(1);

      // Assert
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          items: {
            include: { menu: true }
          },
          table: true
        }
      });
      expect(result).toEqual(mockOrder);
    });

    it('should return null if order not found', async () => {
      // Arrange
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      // Act
      const result = await orderRepository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create order with relations', async () => {
      // Arrange
      const createData = {
        table: { connect: { id: 1 } },
        status: OrderStatus.PENDING,
        totalPrice: 100
      };
      const mockOrder = createMockOrder();
      vi.mocked(prisma.order.create).mockResolvedValue(mockOrder as any);

      // Act
      const result = await orderRepository.create(createData as any);

      // Assert
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          items: {
            include: { menu: true }
          },
          table: true
        }
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('update', () => {
    it('should update order with relations', async () => {
      // Arrange
      const updateData = { status: OrderStatus.COOKING };
      const mockOrder = createMockOrder({ status: OrderStatus.COOKING });
      vi.mocked(prisma.order.update).mockResolvedValue(mockOrder as any);

      // Act
      const result = await orderRepository.update(1, updateData);

      // Assert
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: {
          items: {
            include: { menu: true }
          },
          table: true
        }
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('delete', () => {
    it('should delete order', async () => {
      // Arrange
      const mockOrder = createMockOrder({ id: 1 });
      vi.mocked(prisma.order.delete).mockResolvedValue(mockOrder as any);

      // Act
      const result = await orderRepository.delete(1);

      // Assert
      expect(prisma.order.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findActiveOrders', () => {
    it('should find active orders by status', async () => {
      // Arrange
      const mockOrders = [createMockOrder()];
      const statuses = [OrderStatus.PENDING, OrderStatus.COOKING];
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      // Act
      const result = await orderRepository.findActiveOrders(statuses);

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: statuses }
        },
        include: {
          items: {
            where: { status: { not: 'CANCELLED' } },
            include: { menu: true }
          },
          table: true
        },
        orderBy: { createdAt: 'asc' }
      });
      expect(result).toEqual(mockOrders);
    });

    it('should filter out cancelled items', async () => {
      // Arrange
      const mockOrders = [createMockOrder()];
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      // Act
      await orderRepository.findActiveOrders([OrderStatus.PENDING]);

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            items: expect.objectContaining({
              where: { status: { not: 'CANCELLED' } }
            })
          })
        })
      );
    });
  });
});
