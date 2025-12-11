import { Router } from 'express';
import { createTable, updateTable, deleteTable } from '../controllers/tableController.js';

const router = Router();

router.post('/tables', createTable);       // สร้าง
router.put('/tables/:id', updateTable);    // แก้ไข
router.delete('/tables/:id', deleteTable); // ลบ

export default router;