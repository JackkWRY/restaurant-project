import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file provided' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
        folder: "restaurant-menu",
        resource_type: "auto"
    });

    return res.json({
      status: 'success',
      url: result.secure_url
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ status: 'error', message: 'Upload failed' });
  }
});

export default router;