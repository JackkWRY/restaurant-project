import { Router } from 'express';
import { 
    createTable, 
    updateTable, 
    deleteTable, 
    toggleAvailability, 
    getTableById,
    updateCallStaff,
    getCustomerOrders,
    closeTable
} from '../controllers/tableController.js';

// ✅ 1. เพิ่ม Import Middleware และ Schemas
import { validateRequest } from '../middlewares/validateRequest.js';
import { 
    createTableSchema, 
    updateTableSchema, 
    toggleAvailabilitySchema, 
    updateCallStaffSchema 
} from '../schemas/tableSchema.js';

const router = Router();

router.post('/tables', validateRequest(createTableSchema), createTable);
router.put('/tables/:id', validateRequest(updateTableSchema), updateTable);
router.delete('/tables/:id', deleteTable);
router.patch('/tables/:id/availability', validateRequest(toggleAvailabilitySchema), toggleAvailability);
router.get('/tables/:id', getTableById);
router.patch('/tables/:id/call', validateRequest(updateCallStaffSchema), updateCallStaff);
router.get('/tables/:id/orders', getCustomerOrders);
router.post('/tables/:id/close', closeTable);

export default router;