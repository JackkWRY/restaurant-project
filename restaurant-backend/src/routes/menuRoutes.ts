import { Router } from 'express';
import { 
    getMenus, 
    getAllMenuItems,
    createMenu,
    updateMenu,
    deleteMenu
} from '../controllers/menuController.js';

const router = Router();

router.get('/menus', getMenus);
router.get('/menus/all', getAllMenuItems);
router.post('/menus', createMenu);
router.put('/menus/:id', updateMenu);
router.delete('/menus/:id', deleteMenu);

export default router;