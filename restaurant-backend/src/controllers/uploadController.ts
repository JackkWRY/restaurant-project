import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { sendSuccess, sendBadRequest, sendError } from '../utils/apiResponse.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendBadRequest(res, 'No file provided');
      return;
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
        folder: "restaurant-menu",
        resource_type: "auto"
    });

    sendSuccess(res, { url: result.secure_url });

  } catch (error) {
    sendError(res, 'Upload failed');
  }
};