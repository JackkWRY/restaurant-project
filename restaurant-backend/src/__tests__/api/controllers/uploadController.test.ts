/**
 * @file Upload Controller Tests
 * @description Unit tests for image upload HTTP request handlers
 * 
 * Tests cover:
 * - uploadImage() - image upload with validation
 * - File validation (dimensions, format, size)
 * - Cloudinary integration
 * 
 * Best Practices:
 * - Mock Cloudinary uploader
 * - Mock Sharp for image processing
 * - Test validation rules
 * - Test error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { uploadImage } from '../../../api/controllers/uploadController.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

// Mock Cloudinary
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(),
    },
  },
}));

// Mock Sharp
vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    metadata: vi.fn(),
  })),
}));

import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

describe('UploadController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image successfully with 200 status', async () => {
      // Arrange
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 1024
      };
      const req = mockRequest({
        file: mockFile as any
      });
      const res = mockResponse();

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 800,
          height: 600
        })
      };
      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      vi.mocked(cloudinary.uploader.upload).mockResolvedValue({
        secure_url: 'https://cloudinary.com/image.jpg'
      } as any);

      // Act
      await uploadImage(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          url: 'https://cloudinary.com/image.jpg'
        }
      });
    });

    it('should return 400 when no file provided', async () => {
      // Arrange
      const req = mockRequest({
        file: undefined
      });
      const res = mockResponse();

      // Act
      await uploadImage(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'UPLOAD_001',
        code: 'UPLOAD_001',
      });
    });

    it('should return 400 when image dimensions too small', async () => {
      // Arrange
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 1024
      };
      const req = mockRequest({
        file: mockFile as any
      });
      const res = mockResponse();

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 50,
          height: 50
        })
      };
      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      // Act
      await uploadImage(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Image too small. Minimum dimensions: 100x100px',
        code: 'Image too small. Minimum dimensions: 100x100px',
      });
    });

    it('should return 400 when image dimensions too large', async () => {
      // Arrange
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 1024
      };
      const req = mockRequest({
        file: mockFile as any
      });
      const res = mockResponse();

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 5000,
          height: 5000
        })
      };
      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      // Act
      await uploadImage(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Image too large. Maximum dimensions: 4000x4000px',
        code: 'Image too large. Maximum dimensions: 4000x4000px',
      });
    });

    it('should return 400 when sharp fails to process image', async () => {
      // Arrange
      const mockFile = {
        buffer: Buffer.from('invalid-data'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 1024
      };
      const req = mockRequest({
        file: mockFile as any
      });
      const res = mockResponse();

      const mockSharpInstance = {
        metadata: vi.fn().mockRejectedValue(new Error('Invalid image'))
      };
      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      // Act
      await uploadImage(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'UPLOAD_002',
        code: 'UPLOAD_002',
      });
    });

    it('should upload to Cloudinary with correct parameters', async () => {
      // Arrange
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/png',
        originalname: 'test.png',
        size: 1024
      };
      const req = mockRequest({
        file: mockFile as any
      });
      const res = mockResponse();

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 800,
          height: 600
        })
      };
      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      vi.mocked(cloudinary.uploader.upload).mockResolvedValue({
        secure_url: 'https://cloudinary.com/image.png'
      } as any);

      // Act
      await uploadImage(req as Request, res as Response);

      // Assert
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64,'),
        {
          folder: 'restaurant-menu',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
        }
      );
    });
  });
});
