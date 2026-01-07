import { ApiService } from './api';
import type { Order } from '@/types';

/**
 * Order Service
 * 
 * Handles all order-related API operations including:
 * - Creating new orders
 * - Fetching active orders
 * - Updating order status
 * - Updating individual item status
 */
class OrderService extends ApiService {
  /**
   * Create new order for a table
   */
  async createOrder(tableId: number, items: Array<{ menuId: number; quantity: number; note?: string }>) {
    return this.post<Order>('/api/v1/orders', { tableId, items });
  }

  /**
   * Get all active orders (for kitchen/staff)
   */
  async getActiveOrders() {
    return this.get<Order[]>('/api/v1/orders/active');
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: string) {
    return this.patch(`/api/v1/orders/${orderId}/status`, { status });
  }

  /**
   * Update individual order item status
   */
  async updateItemStatus(itemId: number, status: string) {
    return this.patch(`/api/v1/orders/items/${itemId}/status`, { status });
  }
}

export const orderService = new OrderService();
