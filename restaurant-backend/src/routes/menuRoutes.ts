import { Router } from 'express';
import { 
    getMenus,
    createMenu,
    updateMenu,
    deleteMenu
} from '../controllers/menuController.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { createMenuSchema, updateMenuSchema } from '../schemas/menuSchema.js';

const router = Router();

router.get('/menus', getMenus);
router.post('/menus', validateRequest(createMenuSchema), createMenu);
router.put('/menus/:id', validateRequest(updateMenuSchema), updateMenu);
router.delete('/menus/:id', deleteMenu);

export default router;