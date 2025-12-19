import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('file'), uploadImage);

export default router;