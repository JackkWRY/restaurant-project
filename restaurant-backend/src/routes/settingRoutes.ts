import { Router } from 'express';
import { getRestaurantName, updateRestaurantName } from '../controllers/settingController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { updateSettingSchema } from '../schemas/settingSchema.js';

const router = Router();

// Public route - customers need to see restaurant name
router.get('/settings/name', getRestaurantName);

// Protected route - only admin can update
router.post('/settings/name', requireRole(['ADMIN']), validateRequest(updateSettingSchema), updateRestaurantName);

export default router;