import { Router } from 'express';
import { getTablesStatus, closeTable, getTableDetails } from '../controllers/staffController.js';

const router = Router();

router.get('/staff/tables', getTablesStatus);
router.get('/staff/tables/:id', getTableDetails);
router.post('/staff/tables/:id/close', closeTable);

export default router;