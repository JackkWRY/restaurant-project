import { Router } from 'express';
import { createTable, updateTable, deleteTable, toggleAvailability, getTableById } from '../controllers/tableController.js';

const router = Router();

router.post('/tables', createTable);       // สร้าง
router.put('/tables/:id', updateTable);    // แก้ไข
router.delete('/tables/:id', deleteTable); // ลบ
router.patch('/tables/:id/availability', toggleAvailability); // Toggle
router.get('/tables/:id', getTableById); // เช็คสถานะโต๊ะ

export default router;