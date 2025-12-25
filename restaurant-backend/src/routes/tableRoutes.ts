import { Router } from 'express';
import { 
    createTable, 
    updateTable, 
    deleteTable, 
    toggleAvailability, 
    getTableById,
    updateCallStaff,
    closeTable,
    getTablesStatus,
    getTableDetails
} from '../controllers/tableController.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { 
    createTableSchema, 
    updateTableSchema, 
    toggleAvailabilitySchema, 
    updateCallStaffSchema 
} from '../schemas/tableSchema.js';

const router = Router();

// Admin only routes
router.post('/tables', requireRole(['ADMIN']), validateRequest(createTableSchema), createTable);
router.put('/tables/:id', requireRole(['ADMIN']), validateRequest(updateTableSchema), updateTable);
router.delete('/tables/:id', requireRole(['ADMIN']), deleteTable);

// Staff/Admin routes
router.patch('/tables/:id/availability', requireRole(['ADMIN', 'STAFF']), validateRequest(toggleAvailabilitySchema), toggleAvailability);
router.post('/tables/:id/close', requireRole(['ADMIN', 'STAFF']), closeTable);

// Public routes (for customers)
router.get('/tables/status', getTablesStatus);
router.get('/tables/:id', getTableById);
router.patch('/tables/:id/call', validateRequest(updateCallStaffSchema), updateCallStaff);
router.get('/tables/:id/details', getTableDetails);

export default router;