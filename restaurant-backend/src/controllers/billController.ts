/**
 * @file Bill Controller
 * @description HTTP request handlers for bill management endpoints
 * 
 * This controller handles:
 * - Bill retrieval for tables
 * - Table checkout and bill finalization
 * - Payment processing
 * 
 * @module controllers/billController
 * @requires services/billService
 * @requires middlewares/errorHandler
 * 
 * @see {@link ../services/billService.ts} for business logic
 */

import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { billService } from '../services/billService.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Retrieves the current bill for a table
 * 
 * Returns bill with all orders and items, including totals.
 * 
 * @param req - Express request with table ID in params
 * @param res - Express response
 * @returns 200 with bill data or null if no active bill
 * @throws {Error} If database query fails
 * 
 * @example
 * GET /api/bills/table/1
 */
export const getTableBill = asyncHandler(async (req: Request, res: Response) => {
  const tableId = Number(req.params.tableId);
  const billData = await billService.getTableBill(tableId);

  sendSuccess(res, billData);
});

/**
 * Processes table checkout and closes the bill
 * 
 * Finalizes the bill, marks it as paid, and broadcasts
 * table status updates via Socket.IO to all connected clients.
 * 
 * @param req - Express request with checkout data in body
 * @param res - Express response
 * @returns 200 with checkout result
 * @throws {NotFoundError} If no active bill exists for table
 * 
 * @example
 * POST /api/bills/checkout
 * Body: {
 *   "tableId": 1,
 *   "paymentMethod": "cash"
 * }
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