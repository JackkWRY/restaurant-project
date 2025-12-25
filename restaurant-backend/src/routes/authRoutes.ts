import { Router } from 'express';
import { login, refresh, logout } from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginSchema, refreshSchema, logoutSchema } from '../schemas/authSchema.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh', validateRequest(refreshSchema), refresh);
router.post('/logout', validateRequest(logoutSchema), logout);

export default router;