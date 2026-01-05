/**
 * @file Order Controller
 * @description HTTP request handlers for order management endpoints
 * 
 * This controller handles:
 * - Order creation with real-time notifications
 * - Order status updates across multiple channels
 * - Individual order item status management
 * - Socket.IO broadcasting to staff, kitchen, and customers
 * 
 * @module controllers/orderController
 * @requires services/orderService
 * @requires middlewares/errorHandler
 * @requires utils/apiResponse
 * 
 * @see {@link ../services/orderService.ts} for business logic
 * @see {@link ../schemas/orderSchema.ts} for validation schemas
 */

import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { orderService } from '../services/orderService.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

/**
 * Creates a new order with multiple items in a transaction
 * 
 * Broadcasts the new order to authenticated users (staff/kitchen) and
 * notifies the customer at the specific table via Socket.IO.
 * 
 * @param req - Express request with tableId and items array in body
 * @param res - Express response
 * @returns 201 with created order including all items
 * @throws {NotFoundError} If table or menu items don't exist
 * @throws {ValidationError} If table is not available
 * 
 * @example
 * POST /api/orders
 * Body: {
 *   "tableId": 1,
 *   "items": [{ "menuId": 5, "quantity": 2, "note": "No spicy" }]
 * }
 * 
 * @see {@link ../services/orderService.ts#createOrder} for business logic
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const newOrder = await orderService.createOrder(req.body);

  // Broadcast to authenticated namespace (Staff/Kitchen)
  // This notifies all staff and kitchen displays about the new order
  const authenticatedNs = req.app.get('authenticatedNamespace');
  authenticatedNs.emit('new_order', newOrder);

  // Notify customer at their table via public namespace
  // Only the specific table room receives this update
  const publicNs = req.app.get('publicNamespace');
  publicNs.to(`table-${newOrder.tableId}`).emit('order_status_updated', {
    tableId: newOrder.tableId,
    orderId: newOrder.id,
    status: newOrder.status
  });

  sendCreated(res, newOrder);
});

/**
 * Retrieves all active (non-completed) orders
 * 
 * Returns orders that are pending, cooking, ready, or served.
 * Excludes completed and cancelled orders.
 * 
 * @param req - Express request
 * @param res - Express response
 * @returns 200 with array of active orders
 */
export const getActiveOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.getActiveOrders();
  sendSuccess(res, orders);
});

/**
 * Updates order status and broadcasts changes
 * 
 * Emits real-time updates to both authenticated (staff/kitchen) and
 * public (customer) namespaces for immediate status synchronization.
 * 
 * @param req - Express request with order ID in params and status in body
 * @param res - Express response
 * @returns 200 with updated order
 * @throws {NotFoundError} If order doesn't exist
 * 
 * @see {@link ../services/orderService.ts#updateOrderStatus}
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedOrder = await orderService.updateOrderStatus(Number(id), status);

  // Emit to authenticated namespace (Staff/Kitchen)
  const authenticatedNs = req.app.get('authenticatedNamespace');
  authenticatedNs.emit('order_status_updated', updatedOrder);

  // Emit to public namespace (Customer at specific table)
  const publicNs = req.app.get('publicNamespace');
  publicNs.to(`table-${updatedOrder.tableId}`).emit('order_status_updated', {
    tableId: updatedOrder.tableId,
    orderId: updatedOrder.id,
    status: updatedOrder.status
  });

  sendSuccess(res, updatedOrder);
});

/**
 * Updates individual order item status
 * 
 * Allows granular control over each dish in an order.
 * Broadcasts updates to kitchen, staff, and customer.
 * 
 * @param req - Express request with itemId in params and status in body
 * @param res - Express response
 * @returns 200 with updated order item
 * @throws {NotFoundError} If order item doesn't exist
 * 
 * @see {@link ../services/orderService.ts#updateOrderItemStatus}
 */
export const updateOrderItemStatus = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const { status } = req.body;

  const updatedItem = await orderService.updateOrderItemStatus(Number(itemId), status);

  const payload = {
    id: updatedItem.id,
    orderId: updatedItem.orderId,
    status: updatedItem.status,
    menuName: updatedItem.menu.nameTH,
    tableName: updatedItem.order?.table.name || '',
    tableId: updatedItem.order?.tableId,
    quantity: updatedItem.quantity,
    note: updatedItem.note,
    createdAt: updatedItem.order?.createdAt
  };

  // Emit to authenticated namespace (Staff/Kitchen)
  const authenticatedNs = req.app.get('authenticatedNamespace');
  authenticatedNs.emit('item_status_updated', payload);

  // Emit to public namespace (Customer at specific table)
  const publicNs = req.app.get('publicNamespace');
  if (updatedItem.order?.tableId) {
    publicNs.to(`table-${updatedItem.order.tableId}`).emit('item_status_updated', {
      itemId: updatedItem.id,
      orderId: updatedItem.orderId,
      status: updatedItem.status
    });
  }

  sendSuccess(res, updatedItem);
});