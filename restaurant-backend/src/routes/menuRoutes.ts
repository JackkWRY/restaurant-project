/**
 * @file Menu Routes
 * @description Defines menu management API endpoints
 * 
 * Routes:
 * - GET /api/menus - Get all menus (Public)
 * - POST /api/menus - Create new menu (Admin only)
 * - PUT /api/menus/:id - Update menu (Admin only)
 * - DELETE /api/menus/:id - Delete menu (Admin only)
 * \n * Middleware:
 * - requireRole - Role-based access control
 * - sanitizeBody - Input sanitization
 * - validateRequest - Schema validation
 * 
 * @module routes/menuRoutes
 * @requires express
 * @requires controllers/menuController
 * @requires middlewares/validateRequest
 * @requires middlewares/authMiddleware
 * @requires middlewares/sanitizeMiddleware
 * @requires schemas/menuSchema
 * 
 * @see {@link menuController} for route handlers
 */

import { Router } from 'express';
import { 
    getMenus,
    createMenu,
    updateMenu,
    deleteMenu
} from '../controllers/menuController.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { sanitizeBody } from '../middlewares/sanitizeMiddleware.js';
import { createMenuSchema, updateMenuSchema } from '../schemas/menuSchema.js';

const router = Router();

router.get('/menus', getMenus);
router.post('/menus', 
    requireRole(['ADMIN']), 
    sanitizeBody(['nameTH', 'nameEN', 'description']),
    validateRequest(createMenuSchema), 
    createMenu
);
router.put('/menus/:id', 
    requireRole(['ADMIN']), 
    sanitizeBody(['nameTH', 'nameEN', 'description']),
    validateRequest(updateMenuSchema), 
    updateMenu
);
router.delete('/menus/:id', requireRole(['ADMIN']), deleteMenu);

export default router;