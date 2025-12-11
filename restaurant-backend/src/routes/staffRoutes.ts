import { Router } from 'express';
import { getTablesStatus, closeTable } from '../controllers/staffController.js';

const router = Router();

// GET /api/staff/tables -> ดูสถานะทุกโต๊ะ
router.get('/staff/tables', getTablesStatus);

// POST /api/staff/tables/:id/close -> ปิดโต๊ะ (เช็คบิล)
router.post('/staff/tables/:id/close', closeTable);

export default router;