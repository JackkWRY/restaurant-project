import { Router } from 'express';
import { createOrder, updateOrderStatus, getActiveOrders } from '../controllers/orderController.js';

const router = Router();

router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/orders/active', getActiveOrders);

export default router;