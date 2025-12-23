import { Router } from 'express';
import { getRestaurantName, updateRestaurantName } from '../controllers/settingController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { updateSettingSchema } from '../schemas/settingSchema.js';

const router = Router();

router.get('/settings/name', getRestaurantName);
router.post('/settings/name', validateRequest(updateSettingSchema), updateRestaurantName);

export default router;