/**
 * @file Order Item Repository Tests
 * @description Unit tests for order item data access layer
 * 
 * Tests cover:
 * - findById() with relations
 * - update() item updates
 * - updateStatus() status updates
 * 
 * Best Practices:
 * - Mock Prisma client
 * - Test method calls
 * - Test query parameters
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { orderItemRepository } from '@/database/repositories/orderItemRepository';
import prisma from '@/database/client/prisma';
import { createMockOrderItem } from '@/__tests__/helpers/testData';
import { OrderStatus } from '@/core/config/enums';

// Mock Prisma client
vi.mock('@/database/client/prisma', () => ({
  default: {
    orderItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('OrderItemRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('should find order item by id with relations', async () => {
      // Arrange
      const mockItem = createMockOrderItem({ id: 1 });
      vi.mocked(prisma.orderItem.findUnique).mockResolvedValue(mockItem as any);

      // Act
      const result = await orderItemRepository.findById(1);

      // Assert
      expect(prisma.orderItem.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          menu: true,
          order: {
            include: { table: true }
          }
        }
      });
      expect(result).toEqual(mockItem);
    });

    it('should return null if order item not found', async () => {
      // Arrange
      vi.mocked(prisma.orderItem.findUnique).mockResolvedValue(null);

      // Act
      const result = await orderItemRepository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update order item with relations', async () => {
      // Arrange
      const updateData = { quantity: 3, note: 'Extra spicy' };
      const mockItem = createMockOrderItem({ id: 1, quantity: 3 });
      vi.mocked(prisma.orderItem.update).mockResolvedValue(mockItem as any);

      // Act
      const result = await orderItemRepository.update(1, updateData);

      // Assert
      expect(prisma.orderItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: {
          menu: true,
          order: {
            include: { table: true }
          }
        }
      });
      expect(result).toEqual(mockItem);
    });
  });

  describe('updateStatus', () => {
    it('should update order item status to COOKING', async () => {
      // Arrange
      const mockItem = createMockOrderItem({ id: 1, status: OrderStatus.COOKING });
      vi.mocked(prisma.orderItem.update).mockResolvedValue(mockItem as any);

      // Act
      const result = await orderItemRepository.updateStatus(1, OrderStatus.COOKING);

      // Assert
      expect(prisma.orderItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.COOKING },
        include: {
          menu: true,
          order: {
            include: { table: true }
          }
        }
      });
      expect(result).toEqual(mockItem);
    });

    it('should update order item status to READY', async () => {
      // Arrange
      const mockItem = createMockOrderItem({ id: 1, status: OrderStatus.READY });
      vi.mocked(prisma.orderItem.update).mockResolvedValue(mockItem as any);

      // Act
      const result = await orderItemRepository.updateStatus(1, OrderStatus.READY);

      // Assert
      expect(prisma.orderItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.READY },
        include: expect.any(Object)
      });
      expect(result).toEqual(mockItem);
    });

    it('should update order item status to CANCELLED', async () => {
      // Arrange
      const mockItem = createMockOrderItem({ id: 1, status: OrderStatus.CANCELLED });
      vi.mocked(prisma.orderItem.update).mockResolvedValue(mockItem as any);

      // Act
      const result = await orderItemRepository.updateStatus(1, OrderStatus.CANCELLED);

      // Assert
      expect(prisma.orderItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.CANCELLED },
        include: expect.any(Object)
      });
      expect(result).toEqual(mockItem);
    });
  });
});
