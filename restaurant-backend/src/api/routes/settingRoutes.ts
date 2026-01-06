/**
 * @file Setting Routes
 * @description Defines restaurant settings API endpoints
 * 
 * Routes:
 * - GET /api/settings/name - Get restaurant name (Public)
 * - POST /api/settings/name - Update restaurant name (Admin only)
 * 
 * Middleware:
 * - requireRole - Role-based access control
 * - sanitizeBody - Input sanitization
 * - validateRequest - Schema validation
 * 
 * @module routes/settingRoutes
 * @requires express
 * @requires controllers/settingController
 * @requires middlewares/validateRequest
 * @requires middlewares/authMiddleware
 * @requires middlewares/sanitizeMiddleware
 * @requires schemas/settingSchema
 * 
 * @see {@link settingController} for route handlers
 */

import { Router } from 'express';
import { getRestaurantName, updateRestaurantName } from '../controllers/settingController.js';
import { validateRequest } from '../../core/middlewares/validateRequest.js';
import { requireRole } from '../../core/middlewares/authMiddleware.js';
import { sanitizeBody } from '../../core/middlewares/sanitizeMiddleware.js';
import { updateSettingSchema } from '../schemas/settingSchema.js';

const router = Router();

// Public route - customers need to see restaurant name
router.get('/settings/name', getRestaurantName);

// Protected route - only admin can update
router.post('/settings/name', 
    requireRole(['ADMIN']), 
    sanitizeBody(['name']),
    validateRequest(updateSettingSchema), 
    updateRestaurantName
);

export default router;