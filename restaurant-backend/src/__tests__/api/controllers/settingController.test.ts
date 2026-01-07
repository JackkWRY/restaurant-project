/**
 * @file Setting Controller Tests
 * @description Unit tests for settings HTTP request handlers
 * 
 * Tests cover:
 * - getRestaurantName() - retrieve restaurant name setting
 * - updateRestaurantName() - update restaurant name with upsert
 * 
 * Best Practices:
 * - Mock Prisma directly
 * - Test default values
 * - Test upsert operations
 * - Test HTTP status codes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  getRestaurantName,
  updateRestaurantName
} from '../../../api/controllers/settingController.js';
import prisma from '../../../database/client/prisma.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

// Mock Prisma client
vi.mock('../../../database/client/prisma.js', () => ({
  default: {
    setting: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('SettingController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRestaurantName', () => {
    it('should return restaurant name when setting exists', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const mockSetting = {
        id: 1,
        key: 'restaurant_name',
        value: 'My Restaurant'
      };

      vi.mocked(prisma.setting.findUnique).mockResolvedValue(mockSetting as any);

      // Act
      await getRestaurantName(req as Request, res as Response);

      // Assert
      expect(prisma.setting.findUnique).toHaveBeenCalledWith({
        where: { key: 'restaurant_name' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: 'My Restaurant'
      });
    });

    it('should return default name when setting does not exist', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      vi.mocked(prisma.setting.findUnique).mockResolvedValue(null);

      // Act
      await getRestaurantName(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: 'Restaurant 🍳'
      });
    });

    it('should query by restaurant_name key', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      vi.mocked(prisma.setting.findUnique).mockResolvedValue(null);

      // Act
      await getRestaurantName(req as Request, res as Response);

      // Assert
      expect(prisma.setting.findUnique).toHaveBeenCalledWith({
        where: { key: 'restaurant_name' }
      });
    });
  });

  describe('updateRestaurantName', () => {
    it('should update restaurant name with 200 status', async () => {
      // Arrange
      const req = mockRequest({
        body: { name: 'Updated Restaurant' }
      });
      const res = mockResponse();
      const mockSetting = {
        id: 1,
        key: 'restaurant_name',
        value: 'Updated Restaurant'
      };

      vi.mocked(prisma.setting.upsert).mockResolvedValue(mockSetting as any);

      // Act
      await updateRestaurantName(req as Request, res as Response);

      // Assert
      expect(prisma.setting.upsert).toHaveBeenCalledWith({
        where: { key: 'restaurant_name' },
        update: { value: 'Updated Restaurant' },
        create: { key: 'restaurant_name', value: 'Updated Restaurant' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSetting
      });
    });

    it('should use upsert for atomic create-or-update', async () => {
      // Arrange
      const req = mockRequest({
        body: { name: 'New Restaurant' }
      });
      const res = mockResponse();

      vi.mocked(prisma.setting.upsert).mockResolvedValue({
        id: 1,
        key: 'restaurant_name',
        value: 'New Restaurant'
      } as any);

      // Act
      await updateRestaurantName(req as Request, res as Response);

      // Assert
      expect(prisma.setting.upsert).toHaveBeenCalled();
      const call = vi.mocked(prisma.setting.upsert).mock.calls[0][0];
      expect(call.where).toEqual({ key: 'restaurant_name' });
      expect(call.update).toEqual({ value: 'New Restaurant' });
      expect(call.create).toEqual({ key: 'restaurant_name', value: 'New Restaurant' });
    });

    it('should pass name from request body', async () => {
      // Arrange
      const req = mockRequest({
        body: { name: 'Test Restaurant Name' }
      });
      const res = mockResponse();

      vi.mocked(prisma.setting.upsert).mockResolvedValue({
        id: 1,
        key: 'restaurant_name',
        value: 'Test Restaurant Name'
      } as any);

      // Act
      await updateRestaurantName(req as Request, res as Response);

      // Assert
      const call = vi.mocked(prisma.setting.upsert).mock.calls[0][0];
      expect(call.update.value).toBe('Test Restaurant Name');
      expect(call.create.value).toBe('Test Restaurant Name');
    });
  });
});
