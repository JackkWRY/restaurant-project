/**
 * @file Upload Routes
 * @description Defines file upload API endpoints
 * 
 * Routes:
 * - POST /api/upload - Upload image file
 * 
 * Features:
 * - Multer middleware for file handling
 * - File type validation (JPEG, PNG, WebP)
 * - File size limit (5MB)
 * - Memory storage for cloud upload
 * 
 * @module routes/uploadRoutes
 * @requires express
 * @requires multer
 * @requires controllers/uploadController
 * 
 * @see {@link uploadController} for route handlers
 */

import { Router, Request } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

// Multer configuration with validation
const storage = multer.memoryStorage();

// File filter for image validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed MIME types
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

router.post('/', upload.single('file'), uploadImage);

export default router;