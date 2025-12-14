import { Router } from 'express';
import { getTablesStatus, closeTable, getTableDetails, cancelOrderItem } from '../controllers/staffController.js';

const router = Router();

router.get('/staff/tables', getTablesStatus);
router.get('/staff/tables/:id', getTableDetails);
router.post('/staff/tables/:id/close', closeTable);
router.patch('/staff/items/:itemId/cancel', cancelOrderItem);

export default router;