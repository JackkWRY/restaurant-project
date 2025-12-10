import { Router } from 'express';
import { getMenus, getAllMenuItems } from '../controllers/menuController.js';

const router = Router();

// GET /api/menus -> ได้เมนูแยกตามหมวด
router.get('/menus', getMenus);

// GET /api/menus/all -> ได้เมนูทั้งหมดรวมกัน
router.get('/menus/all', getAllMenuItems);

export default router;