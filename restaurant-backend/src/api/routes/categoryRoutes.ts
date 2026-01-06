/**
 * @file Category Routes
 * @description Defines category management API endpoints
 * 
 * Routes:
 * - GET /api/categories - Get all categories (Public)
 * - POST /api/categories - Create new category (Admin only)
 * - PUT /api/categories/:id - Update category (Admin only)
 * - DELETE /api/categories/:id - Delete category (Admin only)
 * 
 * Middleware:
 * - requireRole - Role-based access control
 * - sanitizeBody - Input sanitization
 * - validateRequest - Schema validation
 * 
 * @module routes/categoryRoutes
 * @requires express
 * @requires controllers/categoryController
 * @requires middlewares/validateRequest
 * @requires middlewares/authMiddleware
 * @requires middlewares/sanitizeMiddleware
 * @requires schemas/categorySchema
 * 
 * @see {@link categoryController} for route handlers
 */

import { Router } from 'express';
import { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from '../controllers/categoryController.js';
import { validateRequest } from '../../core/middlewares/validateRequest.js';
import { requireRole } from '../../core/middlewares/authMiddleware.js';
import { sanitizeBody } from '../../core/middlewares/sanitizeMiddleware.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchema.js';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', 
    requireRole(['ADMIN']), 
    sanitizeBody(['name']),
    validateRequest(createCategorySchema), 
    createCategory
);
router.put('/categories/:id', 
    requireRole(['ADMIN']), 
    sanitizeBody(['name']),
    validateRequest(updateCategorySchema), 
    updateCategory
);
router.delete('/categories/:id', requireRole(['ADMIN']), deleteCategory);

export default router;