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

const router = Router();

router.post('/tables', createTable);
router.put('/tables/:id', updateTable);
router.delete('/tables/:id', deleteTable);
router.patch('/tables/:id/availability', toggleAvailability);
router.get('/tables/:id', getTableById);
router.patch('/tables/:id/call', updateCallStaff);
router.get('/tables/:id/orders', getCustomerOrders);
router.post('/tables/:id/close', closeTable);

export default router;