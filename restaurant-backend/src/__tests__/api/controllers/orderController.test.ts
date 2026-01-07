/**
 * @file Order Controller Tests
 * @description Unit tests for order HTTP request handlers
 * 
 * Tests cover:
 * - createOrder() - order creation with Socket.IO broadcasts
 * - getActiveOrders() - active orders retrieval
 * - updateOrderStatus() - order status updates with broadcasts
 * - updateOrderItemStatus() - item status updates with broadcasts
 * 
 * Best Practices:
 * - Mock services
 * - Mock Socket.IO namespaces
 * - Test HTTP status codes
 * - Test response formats
 * - Test real-time broadcasts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  createOrder,
  getActiveOrders,
  updateOrderStatus,
  updateOrderItemStatus
} from '../../../api/controllers/orderController.js';
import { orderService } from '../../../business/services/orderService.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

// Mock order service
vi.mock('../../../business/services/orderService.js', () => ({
  orderService: {
    createOrder: vi.fn(),
    getActiveOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    updateOrderItemStatus: vi.fn(),
  },
}));

describe('OrderController', () => {
  // Mock Socket.IO namespaces
  let mockAuthenticatedNs: any;
  let mockPublicNs: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Socket.IO namespace mocks
    mockAuthenticatedNs = {
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
    };

    mockPublicNs = {
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
    };
  });

  describe('createOrder', () => {
    it('should create order with 201 status', async () => {
      // Arrange
      const orderData = {
        tableId: 1,
        items: [
          { menuId: 1, quantity: 2, note: 'No spicy' }
        ]
      };
      const req = mockRequest({
        body: orderData,
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockOrder = {
        id: 1,
        tableId: 1,
        status: 'PENDING',
        items: []
      };

      vi.mocked(orderService.createOrder).mockResolvedValue(mockOrder as any);

      // Act
      await createOrder(req as Request, res as Response, mockNext());

      // Assert
      expect(orderService.createOrder).toHaveBeenCalledWith(orderData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockOrder
      });
    });

    it('should broadcast new order to authenticated namespace', async () => {
      // Arrange
      const req = mockRequest({
        body: { tableId: 1, items: [] },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockOrder = { id: 1, tableId: 1, status: 'PENDING' };

      vi.mocked(orderService.createOrder).mockResolvedValue(mockOrder as any);

      // Act
      await createOrder(req as Request, res as Response, mockNext());

      // Assert
      expect(mockAuthenticatedNs.emit).toHaveBeenCalledWith('new_order', mockOrder);
    });

    it('should notify customer at table via public namespace', async () => {
      // Arrange
      const req = mockRequest({
        body: { tableId: 5, items: [] },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockOrder = { id: 10, tableId: 5, status: 'PENDING' };

      vi.mocked(orderService.createOrder).mockResolvedValue(mockOrder as any);

      // Act
      await createOrder(req as Request, res as Response, mockNext());

      // Assert
      expect(mockPublicNs.to).toHaveBeenCalledWith('table-5');
      expect(mockPublicNs.emit).toHaveBeenCalledWith('order_status_updated', {
        tableId: 5,
        orderId: 10,
        status: 'PENDING'
      });
    });
  });

  describe('getActiveOrders', () => {
    it('should return active orders with 200 status', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const mockOrders = [
        { id: 1, status: 'PENDING' },
        { id: 2, status: 'COOKING' }
      ];

      vi.mocked(orderService.getActiveOrders).mockResolvedValue(mockOrders as any);

      // Act
      await getActiveOrders(req as Request, res as Response, mockNext());

      // Assert
      expect(orderService.getActiveOrders).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockOrders
      });
    });

    it('should return empty array when no active orders', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      vi.mocked(orderService.getActiveOrders).mockResolvedValue([]);

      // Act
      await getActiveOrders(req as Request, res as Response, mockNext());

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: []
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status with 200 status', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { status: 'COOKING' },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockOrder = {
        id: 1,
        tableId: 3,
        status: 'COOKING'
      };

      vi.mocked(orderService.updateOrderStatus).mockResolvedValue(mockOrder as any);

      // Act
      await updateOrderStatus(req as Request, res as Response, mockNext());

      // Assert
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(1, 'COOKING');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockOrder
      });
    });

    it('should broadcast status update to authenticated namespace', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { status: 'READY' },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockOrder = { id: 1, tableId: 2, status: 'READY' };

      vi.mocked(orderService.updateOrderStatus).mockResolvedValue(mockOrder as any);

      // Act
      await updateOrderStatus(req as Request, res as Response, mockNext());

      // Assert
      expect(mockAuthenticatedNs.emit).toHaveBeenCalledWith('order_status_updated', mockOrder);
    });

    it('should notify customer at table about status change', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { status: 'SERVED' },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockOrder = { id: 1, tableId: 4, status: 'SERVED' };

      vi.mocked(orderService.updateOrderStatus).mockResolvedValue(mockOrder as any);

      // Act
      await updateOrderStatus(req as Request, res as Response, mockNext());

      // Assert
      expect(mockPublicNs.to).toHaveBeenCalledWith('table-4');
      expect(mockPublicNs.emit).toHaveBeenCalledWith('order_status_updated', {
        tableId: 4,
        orderId: 1,
        status: 'SERVED'
      });
    });
  });

  describe('updateOrderItemStatus', () => {
    it('should update item status with 200 status', async () => {
      // Arrange
      const req = mockRequest({
        params: { itemId: '5' },
        body: { status: 'COOKING' },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockItem = {
        id: 5,
        orderId: 1,
        status: 'COOKING',
        quantity: 2,
        note: 'No spicy',
        menu: { nameTH: 'ข้าวผัด' },
        order: {
          tableId: 3,
          table: { name: 'A3' },
          createdAt: new Date()
        }
      };

      vi.mocked(orderService.updateOrderItemStatus).mockResolvedValue(mockItem as any);

      // Act
      await updateOrderItemStatus(req as Request, res as Response, mockNext());

      // Assert
      expect(orderService.updateOrderItemStatus).toHaveBeenCalledWith(5, 'COOKING');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockItem
      });
    });

    it('should broadcast item status to authenticated namespace', async () => {
      // Arrange
      const req = mockRequest({
        params: { itemId: '5' },
        body: { status: 'READY' },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockItem = {
        id: 5,
        orderId: 1,
        status: 'READY',
        quantity: 1,
        note: null,
        menu: { nameTH: 'ส้มตำ' },
        order: {
          tableId: 2,
          table: { name: 'B2' },
          createdAt: new Date('2024-01-01')
        }
      };

      vi.mocked(orderService.updateOrderItemStatus).mockResolvedValue(mockItem as any);

      // Act
      await updateOrderItemStatus(req as Request, res as Response, mockNext());

      // Assert
      expect(mockAuthenticatedNs.emit).toHaveBeenCalledWith('item_status_updated', {
        id: 5,
        orderId: 1,
        status: 'READY',
        menuName: 'ส้มตำ',
        tableName: 'B2',
        tableId: 2,
        quantity: 1,
        note: null,
        createdAt: mockItem.order.createdAt
      });
    });

    it('should notify customer at table about item status', async () => {
      // Arrange
      const req = mockRequest({
        params: { itemId: '5' },
        body: { status: 'SERVED' },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockItem = {
        id: 5,
        orderId: 1,
        status: 'SERVED',
        quantity: 1,
        note: null,
        menu: { nameTH: 'Test' },
        order: {
          tableId: 6,
          table: { name: 'C6' },
          createdAt: new Date()
        }
      };

      vi.mocked(orderService.updateOrderItemStatus).mockResolvedValue(mockItem as any);

      // Act
      await updateOrderItemStatus(req as Request, res as Response, mockNext());

      // Assert
      expect(mockPublicNs.to).toHaveBeenCalledWith('table-6');
      expect(mockPublicNs.emit).toHaveBeenCalledWith('item_status_updated', {
        itemId: 5,
        orderId: 1,
        status: 'SERVED'
      });
    });
  });
});
