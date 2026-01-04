import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { CLOUDINARY_CONFIG } from '../config/index.js';
import { sendSuccess, sendBadRequest, sendError } from '../utils/apiResponse.js';

cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloudName,
  api_key: CLOUDINARY_CONFIG.apiKey,
  api_secret: CLOUDINARY_CONFIG.apiSecret,
});

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendBadRequest(res, 'No file provided');
      return;
    }

    // Validate image dimensions using sharp
    try {
      const metadata = await sharp(req.file.buffer).metadata();
      
      // Optional: Set minimum dimensions
      const MIN_WIDTH = 100;
      const MIN_HEIGHT = 100;
      const MAX_WIDTH = 4000;
      const MAX_HEIGHT = 4000;
      
      if (metadata.width && metadata.height) {
        if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
          sendBadRequest(res, `Image too small. Minimum dimensions: ${MIN_WIDTH}x${MIN_HEIGHT}px`);
          return;
        }
        
        if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
          sendBadRequest(res, `Image too large. Maximum dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}px`);
          return;
        }
      }
    } catch (sharpError) {
      sendBadRequest(res, 'Invalid image file');
      return;
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
        folder: "restaurant-menu",
        resource_type: "image", // Changed from "auto" to "image" for stricter validation
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    });

    sendSuccess(res, { url: result.secure_url });

  } catch (error) {
    if (error instanceof Error && error.message.includes('File too large')) {
      sendBadRequest(res, 'File size exceeds 5MB limit');
      return;
    }
    
    if (error instanceof Error && error.message.includes('Invalid file type')) {
      sendBadRequest(res, error.message);
      return;
    }
    
    sendError(res, 'Upload failed');
  }
};