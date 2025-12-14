import { Router } from 'express';
import { 
    createOrder, 
    updateOrderStatus, 
    getActiveOrders, 
    updateOrderItemStatus
} from '../controllers/orderController.js';

const router = Router();

router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/orders/active', getActiveOrders);
router.patch('/orders/items/:itemId/status', updateOrderItemStatus);

export default router;