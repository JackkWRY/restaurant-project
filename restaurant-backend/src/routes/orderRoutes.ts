import { Router } from 'express';
import { 
    createOrder, 
    updateOrderStatus, 
    getActiveOrders, 
    updateOrderItemStatus
} from '../controllers/orderController.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { 
    createOrderSchema, 
    updateOrderStatusSchema, 
    updateOrderItemStatusSchema 
} from '../schemas/orderSchema.js';

const router = Router();

router.post('/orders', validateRequest(createOrderSchema), createOrder);
router.patch('/orders/:id/status', requireRole(['ADMIN', 'STAFF']), validateRequest(updateOrderStatusSchema), updateOrderStatus);
router.get('/orders/active', requireRole(['ADMIN', 'STAFF']), getActiveOrders);
router.patch('/orders/items/:itemId/status', requireRole(['ADMIN', 'STAFF']), validateRequest(updateOrderItemStatusSchema), updateOrderItemStatus);

export default router;