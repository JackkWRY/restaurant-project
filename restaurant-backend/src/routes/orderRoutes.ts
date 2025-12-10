import { Router } from 'express';
import { createOrder } from '../controllers/orderController.js';

const router = Router();

// POST /api/orders -> สร้างออเดอร์ใหม่
router.post('/orders', createOrder);

export default router;