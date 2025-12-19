import { Router } from 'express';
import { getTableBill, checkoutTable } from '../controllers/billController.js';

const router = Router();

router.get('/bills/table/:tableId', getTableBill);
router.post('/bills/checkout', checkoutTable);

export default router;