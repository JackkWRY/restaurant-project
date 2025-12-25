import { Router } from 'express';
import { 
    getMenus,
    createMenu,
    updateMenu,
    deleteMenu
} from '../controllers/menuController.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { createMenuSchema, updateMenuSchema } from '../schemas/menuSchema.js';

const router = Router();

router.get('/menus', getMenus);
router.post('/menus', requireRole(['ADMIN']), validateRequest(createMenuSchema), createMenu);
router.put('/menus/:id', requireRole(['ADMIN']), validateRequest(updateMenuSchema), updateMenu);
router.delete('/menus/:id', requireRole(['ADMIN']), deleteMenu);

export default router;