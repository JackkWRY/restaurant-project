/**
 * @file Category Controller Tests
 * @description Unit tests for category HTTP request handlers
 * 
 * Tests cover:
 * - getCategories() - all categories with menu counts
 * - createCategory() - category creation
 * - updateCategory() - category updates
 * - deleteCategory() - category deletion with validation
 * 
 * Best Practices:
 * - Mock Prisma directly (no service layer)
 * - Test HTTP status codes
 * - Test response formats
 * - Test business rules (referential integrity)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../../api/controllers/categoryController.js';
import prisma from '../../../database/client/prisma.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

// Mock Prisma client
vi.mock('../../../database/client/prisma.js', () => ({
  default: {
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    menu: {
      count: vi.fn(),
    },
  },
}));

describe('CategoryController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories with menu counts', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const mockCategories = [
        {
          id: 1,
          name: 'Appetizers',
          _count: { menus: 5 }
        },
        {
          id: 2,
          name: 'Main Dishes',
          _count: { menus: 10 }
        }
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);

      // Act
      await getCategories(req as Request, res as Response);

      // Assert
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              menus: {
                where: {
                  deletedAt: null
                }
              }
            }
          }
        },
        orderBy: { id: 'asc' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCategories
      });
    });

    it('should exclude soft-deleted menus from count', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const mockCategories = [
        {
          id: 1,
          name: 'Appetizers',
          _count: { menus: 3 }
        }
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);

      // Act
      await getCategories(req as Request, res as Response);

      // Assert
      const call = vi.mocked(prisma.category.findMany).mock.calls[0][0] as any;
      expect(call?.include?._count?.select?.menus?.where).toEqual({
        deletedAt: null
      });
    });
  });

  describe('createCategory', () => {
    it('should create category with 201 status', async () => {
      // Arrange
      const req = mockRequest({
        body: { name: 'Desserts' }
      });
      const res = mockResponse();
      const mockCategory = {
        id: 1,
        name: 'Desserts'
      };

      vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

      // Act
      await createCategory(req as Request, res as Response);

      // Assert
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Desserts' }
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCategory
      });
    });

    it('should pass category name to Prisma', async () => {
      // Arrange
      const req = mockRequest({
        body: { name: 'Beverages' }
      });
      const res = mockResponse();

      vi.mocked(prisma.category.create).mockResolvedValue({ id: 1, name: 'Beverages' } as any);

      // Act
      await createCategory(req as Request, res as Response);

      // Assert
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Beverages' }
      });
    });
  });

  describe('updateCategory', () => {
    it('should update category with 200 status', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { name: 'Updated Category' }
      });
      const res = mockResponse();
      const mockCategory = {
        id: 1,
        name: 'Updated Category'
      };

      vi.mocked(prisma.category.update).mockResolvedValue(mockCategory as any);

      // Act
      await updateCategory(req as Request, res as Response);

      // Assert
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Category' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCategory
      });
    });

    it('should parse id parameter as number', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '5' },
        body: { name: 'Test' }
      });
      const res = mockResponse();

      vi.mocked(prisma.category.update).mockResolvedValue({ id: 5, name: 'Test' } as any);

      // Act
      await updateCategory(req as Request, res as Response);

      // Assert
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { name: 'Test' }
      });
    });
  });

  describe('deleteCategory', () => {
    it('should delete category when no menus exist', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' }
      });
      const res = mockResponse();

      vi.mocked(prisma.menu.count).mockResolvedValue(0);
      vi.mocked(prisma.category.delete).mockResolvedValue({ id: 1, name: 'Test' } as any);

      // Act
      await deleteCategory(req as Request, res as Response);

      // Assert
      expect(prisma.menu.count).toHaveBeenCalledWith({
        where: { categoryId: 1 }
      });
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: undefined,
        message: 'Category deleted'
      });
    });

    it('should return 400 when category has menus', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' }
      });
      const res = mockResponse();

      vi.mocked(prisma.menu.count).mockResolvedValue(5);

      // Act
      await deleteCategory(req as Request, res as Response);

      // Assert
      expect(prisma.menu.count).toHaveBeenCalledWith({
        where: { categoryId: 1 }
      });
      expect(prisma.category.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Cannot delete category with existing menus. Please move or delete menus first.'
      });
    });

    it('should check menu count before deletion', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '3' }
      });
      const res = mockResponse();

      vi.mocked(prisma.menu.count).mockResolvedValue(0);
      vi.mocked(prisma.category.delete).mockResolvedValue({ id: 3, name: 'Test' } as any);

      // Act
      await deleteCategory(req as Request, res as Response);

      // Assert
      expect(prisma.menu.count).toHaveBeenCalledBefore(prisma.category.delete as any);
    });
  });
});
