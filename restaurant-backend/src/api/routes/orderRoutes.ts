/**
 * @file Order Routes
 * @description Defines order management API endpoints
 * 
 * Routes:
 * - POST /api/orders - Create new order (Public)
 * - GET /api/orders/active - Get active orders (Admin/Staff)
 * - PATCH /api/orders/items/:itemId/status - Update order item status (Admin/Staff)
 * 
 * Middleware:
 * - requireRole - Role-based access control
 * - sanitizeBodyArray - Array input sanitization
 * - validateRequest - Schema validation
 * 
 * @module routes/orderRoutes
 * @requires express
 * @requires controllers/orderController
 * @requires middlewares/validateRequest
 * @requires middlewares/authMiddleware
 * @requires middlewares/sanitizeMiddleware
 * @requires schemas/orderSchema
 * 
 * @see {@link orderController} for route handlers
 */

import { Router } from 'express';
import { 
    createOrder, 
    getActiveOrders, 
    updateOrderItemStatus
} from '../controllers/orderController.js';

import { validateRequest } from '../../core/middlewares/validateRequest.js';
import { requireRole } from '../../core/middlewares/authMiddleware.js';
import { sanitizeBodyArray } from '../../core/middlewares/sanitizeMiddleware.js';
import { 
    createOrderSchema, 
    updateOrderItemStatusSchema 
} from '../schemas/orderSchema.js';

const router = Router();

router.post('/orders', 
    sanitizeBodyArray('items', ['note']),
    validateRequest(createOrderSchema), 
    createOrder
);
router.get('/orders/active', requireRole(['ADMIN', 'STAFF']), getActiveOrders);
router.patch('/orders/items/:itemId/status', 
    requireRole(['ADMIN', 'STAFF']), 
    validateRequest(updateOrderItemStatusSchema), 
    updateOrderItemStatus
);

export default router;