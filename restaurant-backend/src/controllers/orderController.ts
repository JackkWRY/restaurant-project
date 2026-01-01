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

  const io = req.app.get('io');
  io.emit('new_order', newOrder);

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

  const io = req.app.get('io');
  io.emit('order_status_updated', updatedOrder);

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

  const io = req.app.get('io');

  const payload = {
    id: updatedItem.id,
    orderId: updatedItem.orderId,
    status: updatedItem.status,
    menuName: updatedItem.menu.nameTH,
    tableName: updatedItem.order?.table.name || '',
    quantity: updatedItem.quantity,
    note: updatedItem.note,
    createdAt: updatedItem.order?.createdAt
  };

  io.emit('item_status_updated', payload);

  sendSuccess(res, updatedItem);
});