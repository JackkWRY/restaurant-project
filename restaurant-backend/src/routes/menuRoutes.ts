import { Router } from 'express';
import { 
    getMenus, 
    getAllMenuItems,
    createMenu,
    updateMenu,
    deleteMenu
} from '../controllers/menuController.js';

const router = Router();

// GET /api/menus -> ได้เมนูแยกตามหมวด
router.get('/menus', getMenus);

// GET /api/menus/all -> ได้เมนูทั้งหมดรวมกัน
router.get('/menus/all', getAllMenuItems);

// POST /api/menus -> สร้างเมนูใหม่
router.post('/menus', createMenu);

// PUT /api/menus/:id -> แก้ไขเมนู
router.put('/menus/:id', updateMenu);

// DELETE /api/menus/:id -> ลบเมนู
router.delete('/menus/:id', deleteMenu);

export default router;