import { Router } from 'express';
import { getAnalyticsSummary, getDailyBills } from '../controllers/analyticsController.js';

const router = Router();

router.get('/summary', getAnalyticsSummary);
router.get('/orders', getDailyBills);

export default router;