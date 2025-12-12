import { Router } from 'express';
import { 
    createTable, 
    updateTable, 
    deleteTable, 
    toggleAvailability, 
    getTableById,
    updateCallStaff,
    getCustomerOrders
} from '../controllers/tableController.js';

const router = Router();

router.post('/tables', createTable);       // สร้าง
router.put('/tables/:id', updateTable);    // แก้ไข
router.delete('/tables/:id', deleteTable); // ลบ
router.patch('/tables/:id/availability', toggleAvailability); // Toggle
router.get('/tables/:id', getTableById); // เช็คสถานะโต๊ะ
router.patch('/tables/:id/call', updateCallStaff); // กดเรียก / กดรับทราบ
router.get('/tables/:id/orders', getCustomerOrders); // ลูกค้าดูประวัติ

export default router;