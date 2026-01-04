import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { orderService } from '../services/orderService.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

/**
 * Order Controller
 * Handles HTTP requests for orders
 */

/**
 * POST /api/orders
 * Create new order
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const newOrder = await orderService.createOrder(req.body);

  // Emit to authenticated namespace (Staff/Kitchen)
  const authenticatedNs = req.app.get('authenticatedNamespace');
  authenticatedNs.emit('new_order', newOrder);

  // Emit to public namespace (Customer at specific table)
  const publicNs = req.app.get('publicNamespace');
  publicNs.to(`table-${newOrder.tableId}`).emit('order_status_updated', {
    tableId: newOrder.tableId,
    orderId: newOrder.id,
    status: newOrder.status
  });

  sendCreated(res, newOrder);
});

/**
 * GET /api/orders/active
 * Get active orders
 */
export const getActiveOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.getActiveOrders();
  sendSuccess(res, orders);
});

/**
 * PATCH /api/orders/:id/status
 * Update order status
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
 * PATCH /api/orders/items/:itemId/status
 * Update order item status
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