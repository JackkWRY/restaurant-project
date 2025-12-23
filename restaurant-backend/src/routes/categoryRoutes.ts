import { Router } from 'express';
import { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from '../controllers/categoryController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchema.js';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', validateRequest(createCategorySchema), createCategory);
router.put('/categories/:id', validateRequest(updateCategorySchema), updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;