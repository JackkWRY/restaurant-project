import { Router } from 'express';
import { 
    createOrder, 
    updateOrderStatus, 
    getActiveOrders, 
    updateOrderItemStatus
} from '../controllers/orderController.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { 
    createOrderSchema, 
    updateOrderStatusSchema, 
    updateOrderItemStatusSchema 
} from '../schemas/orderSchema.js';

const router = Router();

router.post('/orders', validateRequest(createOrderSchema), createOrder);
router.patch('/orders/:id/status', validateRequest(updateOrderStatusSchema), updateOrderStatus);
router.get('/orders/active', getActiveOrders);
router.patch('/orders/items/:itemId/status', validateRequest(updateOrderItemStatusSchema), updateOrderItemStatus);

export default router;