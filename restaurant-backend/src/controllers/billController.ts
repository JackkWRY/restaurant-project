import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { billService } from '../services/billService.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Bill Controller
 * Handles HTTP requests for bills
 */

/**
 * GET /api/bills/table/:tableId
 * Get table bill
 */
export const getTableBill = asyncHandler(async (req: Request, res: Response) => {
  const tableId = Number(req.params.tableId);
  const billData = await billService.getTableBill(tableId);

  sendSuccess(res, billData);
});

/**
 * POST /api/bills/checkout
 * Checkout table
 */
export const checkoutTable = asyncHandler(async (req: Request, res: Response) => {
  const result = await billService.checkoutTable(req.body);

  // Emit to authenticated namespace (Staff/Kitchen)
  const authenticatedNs = req.app.get('authenticatedNamespace');
  authenticatedNs.emit('table_updated', { id: req.body.tableId, isOccupied: false });

  // Emit to public namespace (Customer at specific table)
  const publicNs = req.app.get('publicNamespace');
  publicNs.to(`table-${req.body.tableId}`).emit('table_updated', {
    id: req.body.tableId,
    isOccupied: false
  });

  res.json({ status: 'success', ...result });
});