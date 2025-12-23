import { Router } from 'express';
import { getTableBill, checkoutTable } from '../controllers/billController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { checkoutSchema } from '../schemas/billSchema.js';

const router = Router();

router.get('/bills/table/:tableId', getTableBill);
router.post('/bills/checkout', validateRequest(checkoutSchema), checkoutTable);

export default router;