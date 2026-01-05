/**
 * @file Analytics Routes
 * @description Defines analytics and reporting API endpoints
 * 
 * Routes:
 * - GET /api/analytics/summary - Get analytics summary (Admin only)
 * - GET /api/analytics/orders - Get daily bills (Admin only)
 * - GET /api/analytics/history - Get bill history (Admin only)
 * 
 * Middleware:
 * - requireRole - Role-based access control (Admin only)
 * 
 * @module routes/analyticsRoutes
 * @requires express
 * @requires controllers/analyticsController
 * @requires middlewares/authMiddleware
 * 
 * @see {@link analyticsController} for route handlers
 */

import { Router } from 'express';
import { getAnalyticsSummary, getDailyBills, getBillHistory } from '../controllers/analyticsController.js';
import { requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/summary', requireRole(['ADMIN']), getAnalyticsSummary);
router.get('/orders', requireRole(['ADMIN']), getDailyBills);
router.get('/history', requireRole(['ADMIN']), getBillHistory);

export default router;