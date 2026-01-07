/**
 * @file Menu Repository Tests
 * @description Unit tests for menu data access layer
 * 
 * Tests cover:
 * - findAll() with filters
 * - findManyPaginated() with pagination
 * - findById() single retrieval
 * - create() menu creation
 * - update() menu updates
 * - delete() hard delete
 * - softDelete() soft delete
 * - count() with filters
 * 
 * Best Practices:
 * - Mock Prisma client
 * - Test method calls
 * - Test query parameters
 * - Test return values
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { menuRepository } from '@/database/repositories/menuRepository';
import prisma from '@/database/client/prisma';
import { createMockMenu } from '@/__tests__/helpers/testData';
import { Decimal } from '@prisma/client/runtime/library';

// Mock Prisma client
vi.mock('@/database/client/prisma', () => ({
  default: {
    menu: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('MenuRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all menus with category', async () => {
      // Arrange
      const mockMenus = [
        createMockMenu({ id: 1 }),
        createMockMenu({ id: 2 }),
      ];
      vi.mocked(prisma.menu.findMany).mockResolvedValue(mockMenus as any);

      // Act
      const result = await menuRepository.findAll();

      // Assert
      expect(prisma.menu.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { category: true },
        orderBy: { id: 'desc' }
      });
      expect(result).toEqual(mockMenus);
    });

    it('should find menus with filters', async () => {
      // Arrange
      const mockMenus = [createMockMenu()];
      const filters = { deletedAt: null, isAvailable: true };
      vi.mocked(prisma.menu.findMany).mockResolvedValue(mockMenus as any);

      // Act
      const result = await menuRepository.findAll(filters);

      // Assert
      expect(prisma.menu.findMany).toHaveBeenCalledWith({
        where: filters,
        include: { category: true },
        orderBy: { id: 'desc' }
      });
      expect(result).toEqual(mockMenus);
    });
  });

  describe('findManyPaginated', () => {
    it('should return paginated menus with total count', async () => {
      // Arrange
      const mockMenus = [createMockMenu({ id: 1 })];
      vi.mocked(prisma.menu.findMany).mockResolvedValue(mockMenus as any);
      vi.mocked(prisma.menu.count).mockResolvedValue(10);

      // Act
      const result = await menuRepository.findManyPaginated({
        where: { deletedAt: null },
        skip: 0,
        take: 5
      });

      // Assert
      expect(prisma.menu.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: { category: true },
        orderBy: { id: 'desc' },
        skip: 0,
        take: 5
      });
      expect(prisma.menu.count).toHaveBeenCalledWith({
        where: { deletedAt: null }
      });
      expect(result.menus).toEqual(mockMenus);
      expect(result.total).toBe(10);
    });

    it('should handle pagination with skip and take', async () => {
      // Arrange
      const mockMenus = [createMockMenu()];
      vi.mocked(prisma.menu.findMany).mockResolvedValue(mockMenus as any);
      vi.mocked(prisma.menu.count).mockResolvedValue(25);

      // Act
      const result = await menuRepository.findManyPaginated({
        skip: 10,
        take: 5
      });

      // Assert
      expect(prisma.menu.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 5
        })
      );
      expect(result.total).toBe(25);
    });
  });

  describe('findById', () => {
    it('should find menu by id with category', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1 });
      vi.mocked(prisma.menu.findUnique).mockResolvedValue(mockMenu as any);

      // Act
      const result = await menuRepository.findById(1);

      // Assert
      expect(prisma.menu.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { category: true }
      });
      expect(result).toEqual(mockMenu);
    });

    it('should return null if menu not found', async () => {
      // Arrange
      vi.mocked(prisma.menu.findUnique).mockResolvedValue(null);

      // Act
      const result = await menuRepository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create menu with category', async () => {
      // Arrange
      const createData = {
        nameTH: 'ข้าวผัด',
        nameEN: 'Fried Rice',
        price: new Decimal(50),
        category: { connect: { id: 1 } }
      };
      const mockMenu = createMockMenu(createData as any);
      vi.mocked(prisma.menu.create).mockResolvedValue(mockMenu as any);

      // Act
      const result = await menuRepository.create(createData as any);

      // Assert
      expect(prisma.menu.create).toHaveBeenCalledWith({
        data: createData,
        include: { category: true }
      });
      expect(result).toEqual(mockMenu);
    });
  });

  describe('update', () => {
    it('should update menu with category', async () => {
      // Arrange
      const updateData = { nameTH: 'Updated Name' };
      const mockMenu = createMockMenu({ id: 1, nameTH: 'Updated Name' });
      vi.mocked(prisma.menu.update).mockResolvedValue(mockMenu as any);

      // Act
      const result = await menuRepository.update(1, updateData);

      // Assert
      expect(prisma.menu.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: { category: true }
      });
      expect(result).toEqual(mockMenu);
    });
  });

  describe('delete', () => {
    it('should permanently delete menu', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1 });
      vi.mocked(prisma.menu.delete).mockResolvedValue(mockMenu as any);

      // Act
      const result = await menuRepository.delete(1);

      // Assert
      expect(prisma.menu.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toEqual(mockMenu);
    });
  });

  describe('softDelete', () => {
    it('should soft delete menu by setting deletedAt', async () => {
      // Arrange
      const mockMenu = createMockMenu({ id: 1 });
      vi.mocked(prisma.menu.update).mockResolvedValue(mockMenu as any);

      // Act
      await menuRepository.softDelete(1);

      // Assert
      expect(prisma.menu.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) }
      });
    });
  });

  describe('count', () => {
    it('should count all menus', async () => {
      // Arrange
      vi.mocked(prisma.menu.count).mockResolvedValue(10);

      // Act
      const result = await menuRepository.count();

      // Assert
      expect(prisma.menu.count).toHaveBeenCalledWith({
        where: undefined
      });
      expect(result).toBe(10);
    });

    it('should count menus with filters', async () => {
      // Arrange
      const filters = { deletedAt: null };
      vi.mocked(prisma.menu.count).mockResolvedValue(5);

      // Act
      const result = await menuRepository.count(filters);

      // Assert
      expect(prisma.menu.count).toHaveBeenCalledWith({
        where: filters
      });
      expect(result).toBe(5);
    });
  });
});
