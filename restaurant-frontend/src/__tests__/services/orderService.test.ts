/**
 * @file Order Service Tests
 * @description Unit tests for order API service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { orderService } from '@/services/orderService';

vi.mock('@/lib/utils', () => ({
  API_URL: 'http://localhost:3001',
  authFetch: vi.fn(),
}));

import { authFetch } from '@/lib/utils';

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order with table and items', async () => {
      const orderData = {
        tableId: 1,
        items: [{ menuId: 1, quantity: 2, note: 'No spicy' }]
      };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { id: 1, ...orderData } }),
      } as Response);

      await orderService.createOrder(orderData.tableId, orderData.items);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/orders',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(orderData),
        })
      );
    });
  });

  describe('getActiveOrders', () => {
    it('should fetch all active orders', async () => {
      const mockOrders = [{ id: 1, tableId: 1, status: 'PENDING' }];
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockOrders }),
      } as Response);

      await orderService.getActiveOrders();

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/orders/active');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status with PATCH request', async () => {
      const status = 'COMPLETED';
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success' }),
      } as Response);

      await orderService.updateOrderStatus(1, status);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/orders/1/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status }),
        })
      );
    });
  });

  describe('updateItemStatus', () => {
    it('should update order item status', async () => {
      const status = 'COMPLETED';
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success' }),
      } as Response);

      await orderService.updateItemStatus(1, status);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/orders/items/1/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status }),
        })
      );
    });
  });
});
