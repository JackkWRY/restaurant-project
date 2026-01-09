/**
 * @file Menu Controller Tests
 * @description Unit tests for menu HTTP request handlers
 * 
 * Tests cover:
 * - getMenus() - grouped and paginated responses
 * - getMenuById() - single menu retrieval
 * - createMenu() - menu creation
 * - updateMenu() - menu updates
 * - deleteMenu() - soft delete
 * - toggleAvailability() - availability toggle
 * - toggleVisibility() - visibility toggle
 * 
 * Best Practices:
 * - Mock services
 * - Test HTTP status codes
 * - Test response formats
 * - Test service integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleAvailability,
  toggleVisibility
} from '../../../api/controllers/menuController.js';
import { menuService } from '../../../business/services/menuService.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

// Mock menu service
vi.mock('../../../business/services/menuService.js', () => ({
  menuService: {
    getMenus: vi.fn(),
    getMenuById: vi.fn(),
    createMenu: vi.fn(),
    updateMenu: vi.fn(),
    deleteMenu: vi.fn(),
    toggleAvailability: vi.fn(),
    toggleVisibility: vi.fn(),
  },
}));

describe('MenuController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMenus', () => {
    it('should return menus grouped by categories', async () => {
      // Arrange
      const req = mockRequest({ query: {} });
      const res = mockResponse();
      const mockData = {
        categories: [
          { id: 1, name: 'Appetizers', menus: [] },
          { id: 2, name: 'Main Dishes', menus: [] }
        ]
      };
      
      vi.mocked(menuService.getMenus).mockResolvedValue(mockData);

      // Act
      await getMenus(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.getMenus).toHaveBeenCalledWith({
        scope: undefined,
        page: 1,
        limit: 100
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockData.categories
      });
    });

    it('should return paginated menus when scope=all', async () => {
      // Arrange
      const req = mockRequest({
        query: { scope: 'all', page: '2', limit: '10' }
      });
      const res = mockResponse();
      const mockData = {
        menus: [{ id: 1 }, { id: 2 }],
        pagination: {
          page: 2,
          limit: 10,
          totalPages: 5,
          totalItems: 50
        }
      };
      
      vi.mocked(menuService.getMenus).mockResolvedValue(mockData as any);

      // Act
      await getMenus(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.getMenus).toHaveBeenCalledWith({
        scope: 'all',
        page: 2,
        limit: 10
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockData.menus,
        pagination: mockData.pagination
      });
    });

    it('should handle default pagination params', async () => {
      // Arrange
      const req = mockRequest({ query: { scope: 'all' } });
      const res = mockResponse();
      const mockData = { menus: [], pagination: {} };
      
      vi.mocked(menuService.getMenus).mockResolvedValue(mockData as any);

      // Act
      await getMenus(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.getMenus).toHaveBeenCalledWith({
        scope: 'all',
        page: 1,
        limit: 100
      });
    });
  });

  describe('getMenuById', () => {
    it('should return menu by id with 200 status', async () => {
      // Arrange
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();
      const mockMenu = { id: 1, nameTH: 'ข้าวผัด', price: 50 };
      
      vi.mocked(menuService.getMenuById).mockResolvedValue(mockMenu as any);

      // Act
      await getMenuById(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.getMenuById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockMenu
      });
    });

    it('should parse id parameter as number', async () => {
      // Arrange
      const req = mockRequest({ params: { id: '123' } });
      const res = mockResponse();
      
      vi.mocked(menuService.getMenuById).mockResolvedValue({} as any);

      // Act
      await getMenuById(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.getMenuById).toHaveBeenCalledWith(123);
    });
  });

  describe('createMenu', () => {
    it('should create menu with 201 status', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          nameTH: 'ข้าวผัด',
          nameEN: 'Fried Rice',
          price: 50,
          categoryId: 1
        }
      });
      const res = mockResponse();
      const mockMenu = { id: 1, nameTH: 'ข้าวผัด' };
      
      vi.mocked(menuService.createMenu).mockResolvedValue(mockMenu as any);

      // Act
      await createMenu(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.createMenu).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockMenu
      });
    });

    it('should pass request body to service', async () => {
      // Arrange
      const menuData = {
        nameTH: 'ส้มตำ',
        price: 40,
        categoryId: 2,
        isRecommended: true
      };
      const req = mockRequest({ body: menuData });
      const res = mockResponse();
      
      vi.mocked(menuService.createMenu).mockResolvedValue({} as any);

      // Act
      await createMenu(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.createMenu).toHaveBeenCalledWith(menuData);
    });
  });

  describe('updateMenu', () => {
    it('should update menu with 200 status', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { price: 60, isAvailable: false }
      });
      const res = mockResponse();
      const mockMenu = { id: 1, price: 60, isAvailable: false };
      
      vi.mocked(menuService.updateMenu).mockResolvedValue(mockMenu as any);

      // Act
      await updateMenu(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.updateMenu).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockMenu
      });
    });

    it('should pass id and body to service', async () => {
      // Arrange
      const updateData = { nameTH: 'Updated Name' };
      const req = mockRequest({
        params: { id: '5' },
        body: updateData
      });
      const res = mockResponse();
      
      vi.mocked(menuService.updateMenu).mockResolvedValue({} as any);

      // Act
      await updateMenu(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.updateMenu).toHaveBeenCalledWith(5, updateData);
    });
  });

  describe('deleteMenu', () => {
    it('should delete menu and return success message', async () => {
      // Arrange
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();
      
      vi.mocked(menuService.deleteMenu).mockResolvedValue({ id: 1 } as any);

      // Act
      await deleteMenu(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.deleteMenu).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'SUCCESS_MENU_001',
        code: 'SUCCESS_MENU_001',
      });
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle availability with 200 status', async () => {
      // Arrange
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();
      const mockMenu = { id: 1, isAvailable: false };
      
      vi.mocked(menuService.toggleAvailability).mockResolvedValue(mockMenu as any);

      // Act
      await toggleAvailability(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.toggleAvailability).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockMenu
      });
    });
  });

  describe('toggleVisibility', () => {
    it('should toggle visibility with 200 status', async () => {
      // Arrange
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();
      const mockMenu = { id: 1, isVisible: false };
      
      vi.mocked(menuService.toggleVisibility).mockResolvedValue(mockMenu as any);

      // Act
      await toggleVisibility(req as Request, res as Response, mockNext());

      // Assert
      expect(menuService.toggleVisibility).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockMenu
      });
    });
  });
});
