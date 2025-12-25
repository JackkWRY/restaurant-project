import { Router } from 'express';
import { getAnalyticsSummary, getDailyBills, getBillHistory } from '../controllers/analyticsController.js';
import { requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/summary', requireRole(['ADMIN']), getAnalyticsSummary);
router.get('/orders', requireRole(['ADMIN']), getDailyBills);
router.get('/history', requireRole(['ADMIN']), getBillHistory);

export default router;