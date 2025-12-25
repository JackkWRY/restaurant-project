import { Router } from 'express';
import { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from '../controllers/categoryController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchema.js';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', requireRole(['ADMIN']), validateRequest(createCategorySchema), createCategory);
router.put('/categories/:id', requireRole(['ADMIN']), validateRequest(updateCategorySchema), updateCategory);
router.delete('/categories/:id', requireRole(['ADMIN']), deleteCategory);

export default router;