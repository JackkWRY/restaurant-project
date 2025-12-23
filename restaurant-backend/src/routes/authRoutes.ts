import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginSchema } from '../schemas/authSchema.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);

export default router;