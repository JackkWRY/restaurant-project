import { Router } from 'express';
import { getTableBill, checkoutTable } from '../controllers/billController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { checkoutSchema } from '../schemas/billSchema.js';

const router = Router();

// Public route - customers need to see their table's bill/history
router.get('/bills/table/:tableId', getTableBill);

// Protected route - only staff/admin can process checkout
router.post('/bills/checkout', requireRole(['ADMIN', 'STAFF']), validateRequest(checkoutSchema), checkoutTable);

export default router;