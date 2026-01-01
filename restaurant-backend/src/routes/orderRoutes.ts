import { Router } from 'express';
import { 
    createOrder, 
    getActiveOrders, 
    updateOrderItemStatus
} from '../controllers/orderController.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { 
    createOrderSchema, 
    updateOrderItemStatusSchema 
} from '../schemas/orderSchema.js';

const router = Router();

router.post('/orders', validateRequest(createOrderSchema), createOrder);
router.get('/orders/active', requireRole(['ADMIN', 'STAFF']), getActiveOrders);
router.patch('/orders/items/:itemId/status', requireRole(['ADMIN', 'STAFF']), validateRequest(updateOrderItemStatusSchema), updateOrderItemStatus);

export default router;