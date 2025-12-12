import { Router } from 'express';
import { getRestaurantName, updateRestaurantName } from '../controllers/settingController.js';

const router = Router();

router.get('/settings/name', getRestaurantName);
router.post('/settings/name', updateRestaurantName);

export default router;