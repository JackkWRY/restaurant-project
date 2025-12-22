import { Router } from 'express';
import { 
    getMenus, 
    getAllMenuItems,
    createMenu,
    updateMenu,
    deleteMenu
} from '../controllers/menuController.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { createMenuSchema, updateMenuSchema } from '../schemas/menuSchema.js';

const router = Router();

router.get('/menus', getMenus);
router.get('/menus/all', getAllMenuItems);
router.post('/menus', validateRequest(createMenuSchema), createMenu);
router.put('/menus/:id', validateRequest(updateMenuSchema), updateMenu);
router.delete('/menus/:id', deleteMenu);

export default router;