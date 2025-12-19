import { Router } from 'express';
import { getAnalyticsSummary, getDailyBills, getBillHistory } from '../controllers/analyticsController.js';

const router = Router();

router.get('/summary', getAnalyticsSummary);
router.get('/orders', getDailyBills);
router.get('/history', getBillHistory);

export default router;