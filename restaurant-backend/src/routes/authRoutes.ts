/**
 * @file Authentication Routes
 * @description Defines authentication-related API endpoints
 * 
 * Routes:
 * - POST /api/login - User login with credentials
 * - POST /api/refresh - Refresh access token
 * - POST /api/logout - User logout
 * 
 * Middleware:
 * - validateRequest - Schema validation for all routes
 * 
 * @module routes/authRoutes
 * @requires express
 * @requires controllers/authController
 * @requires middlewares/validateRequest
 * @requires schemas/authSchema
 * 
 * @see {@link authController} for route handlers
 */

import { Router } from 'express';
import { login, refresh, logout } from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginSchema, refreshSchema, logoutSchema } from '../schemas/authSchema.js';

const router = Router();

// POST /api/login - Authenticate user and return tokens
router.post('/login', validateRequest(loginSchema), login);

// POST /api/refresh - Refresh access token using refresh token
router.post('/refresh', validateRequest(refreshSchema), refresh);

// POST /api/logout - Invalidate refresh token
router.post('/logout', validateRequest(logoutSchema), logout);

export default router;