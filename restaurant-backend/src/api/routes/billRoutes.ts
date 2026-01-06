/**
 * @file Bill Routes
 * @description Defines bill-related API endpoints
 * 
 * Routes:
 * - GET /api/bills/table/:tableId - Get bill for specific table (Public)
 * - POST /api/bills/checkout - Process checkout and payment (Admin/Staff)
 * 
 * Middleware:
 * - requireRole - Role-based access control
 * - validateRequest - Schema validation
 * 
 * @module routes/billRoutes
 * @requires express
 * @requires controllers/billController
 * @requires middlewares/validateRequest
 * @requires middlewares/authMiddleware
 * @requires schemas/billSchema
 * 
 * @see {@link billController} for route handlers
 */

import { Router } from 'express';
import { getTableBill, checkoutTable } from '../controllers/billController.js';
import { validateRequest } from '../../core/middlewares/validateRequest.js';
import { requireRole } from '../../core/middlewares/authMiddleware.js';
import { checkoutSchema } from '../schemas/billSchema.js';

const router = Router();

// Public route - customers need to see their table's bill/history
router.get('/bills/table/:tableId', getTableBill);

// Protected route - only staff/admin can process checkout
router.post('/bills/checkout', requireRole(['ADMIN', 'STAFF']), validateRequest(checkoutSchema), checkoutTable);

export default router;