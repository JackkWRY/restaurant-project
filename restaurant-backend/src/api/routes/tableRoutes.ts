/**
 * @file Table Routes
 * @description Defines table management API endpoints
 * 
 * Routes:
 * - POST /api/tables - Create new table (Admin only)
 * - PUT /api/tables/:id - Update table (Admin only)
 * - DELETE /api/tables/:id - Delete table (Admin only)
 * - PATCH /api/tables/:id/availability - Toggle availability (Admin/Staff)
 * - POST /api/tables/:id/close - Close table and create bill (Admin/Staff)
 * - GET /api/tables/status - Get all tables status (Public)
 * - GET /api/tables/:id - Get table by ID (Public)
 * - PATCH /api/tables/:id/call - Call staff (Public)
 * - GET /api/tables/:id/details - Get table details (Public)
 * 
 * Middleware:
 * - requireRole - Role-based access control
 * - sanitizeBody - Input sanitization
 * - validateRequest - Schema validation
 * 
 * @module routes/tableRoutes
 * @requires express
 * @requires controllers/tableController
 * @requires middlewares/authMiddleware
 * @requires middlewares/sanitizeMiddleware
 * @requires middlewares/validateRequest
 * @requires schemas/tableSchema
 * 
 * @see {@link tableController} for route handlers
 */

import { Router } from 'express';
import { 
    createTable, 
    updateTable, 
    deleteTable, 
    toggleAvailability, 
    getTableById,
    updateCallStaff,
    closeTable,
    getTablesStatus,
    getTableDetails
} from '../controllers/tableController.js';

import { validateRequest } from '../../core/middlewares/validateRequest.js';
import { requireRole } from '../../core/middlewares/authMiddleware.js';
import { sanitizeBody } from '../../core/middlewares/sanitizeMiddleware.js';
import { 
    createTableSchema, 
    updateTableSchema, 
    toggleAvailabilitySchema, 
    updateCallStaffSchema 
} from '../schemas/tableSchema.js';

const router = Router();

// Admin only routes
router.post('/tables', 
    requireRole(['ADMIN']), 
    sanitizeBody(['name']),
    validateRequest(createTableSchema), 
    createTable
);
router.put('/tables/:id', 
    requireRole(['ADMIN']), 
    sanitizeBody(['name']),
    validateRequest(updateTableSchema), 
    updateTable
);
router.delete('/tables/:id', requireRole(['ADMIN']), deleteTable);

// Staff/Admin routes
router.patch('/tables/:id/availability', requireRole(['ADMIN', 'STAFF']), validateRequest(toggleAvailabilitySchema), toggleAvailability);
router.post('/tables/:id/close', requireRole(['ADMIN', 'STAFF']), closeTable);

// Public routes (for customers)
router.get('/tables/status', getTablesStatus);
router.get('/tables/:id', getTableById);
router.patch('/tables/:id/call', validateRequest(updateCallStaffSchema), updateCallStaff);
router.get('/tables/:id/details', getTableDetails);

export default router;