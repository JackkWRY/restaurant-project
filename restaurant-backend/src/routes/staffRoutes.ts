import { Router } from 'express';
import { getTablesStatus, getTableDetails, cancelOrderItem } from '../controllers/staffController.js';

const router = Router();

router.get('/staff/tables', getTablesStatus);
router.get('/staff/tables/:id', getTableDetails);
router.patch('/staff/items/:itemId/cancel', cancelOrderItem);

export default router;