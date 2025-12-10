import { Router } from 'express';
import { createOrder, updateOrderStatus } from '../controllers/orderController.js';


const router = Router();

// POST /api/orders -> สร้างออเดอร์ใหม่
router.post('/orders', createOrder);

// PATCH /api/orders/:id/status -> อัปเดตสถานะ (เพิ่มบรรทัดนี้)
router.patch('/orders/:id/status', updateOrderStatus);

export default router;