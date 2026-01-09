/**
 * @file Table Repository Tests
 * @description Unit tests for table data access layer
 * 
 * Tests cover:
 * - findAll() with filters
 * - findById() single retrieval
 * - findByName() name lookup
 * - create() table creation
 * - update() table updates
 * - delete() table deletion
 * - updateOccupiedStatus() status updates
 * - updateCallStaffStatus() staff call updates
 * 
 * Best Practices:
 * - Mock Prisma client
 * - Test method calls
 * - Test query parameters
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tableRepository } from '@/database/repositories/tableRepository';
import prisma from '@/database/client/prisma';
import { createMockTable } from '@/__tests__/helpers/testData';

// Mock Prisma client
vi.mock('@/database/client/prisma', () => ({
  default: {
    table: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('TableRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all tables', async () => {
      // Arrange
      const mockTables = [
        createMockTable({ id: 1 }),
        createMockTable({ id: 2 }),
      ];
      vi.mocked(prisma.table.findMany).mockResolvedValue(mockTables);

      // Act
      const result = await tableRepository.findAll();

      // Assert
      expect(prisma.table.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { id: 'asc' }
      });
      expect(result).toEqual(mockTables);
    });

    it('should find tables with filters', async () => {
      // Arrange
      const mockTables = [createMockTable()];
      const filters = { isAvailable: true };
      vi.mocked(prisma.table.findMany).mockResolvedValue(mockTables);

      // Act
      const result = await tableRepository.findAll(filters);

      // Assert
      expect(prisma.table.findMany).toHaveBeenCalledWith({
        where: { ...filters, deletedAt: null },
        orderBy: { id: 'asc' }
      });
      expect(result).toEqual(mockTables);
    });
  });

  describe('findById', () => {
    it('should find table by id', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1 });
      vi.mocked(prisma.table.findFirst).mockResolvedValue(mockTable);

      // Act
      const result = await tableRepository.findById(1);

      // Assert
      expect(prisma.table.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null }
      });
      expect(result).toEqual(mockTable);
    });

    it('should return null if table not found', async () => {
      // Arrange
      vi.mocked(prisma.table.findFirst).mockResolvedValue(null);

      // Act
      const result = await tableRepository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find table by name', async () => {
      // Arrange
      const mockTable = createMockTable({ name: 'A1' });
      vi.mocked(prisma.table.findFirst).mockResolvedValue(mockTable);

      // Act
      const result = await tableRepository.findByName('A1');

      // Assert
      expect(prisma.table.findFirst).toHaveBeenCalledWith({
        where: { name: 'A1', deletedAt: null }
      });
      expect(result).toEqual(mockTable);
    });
  });

  describe('create', () => {
    it('should create table', async () => {
      // Arrange
      const createData = { name: 'B1', qrCode: 'qr-code' };
      const mockTable = createMockTable(createData);
      vi.mocked(prisma.table.create).mockResolvedValue(mockTable);

      // Act
      const result = await tableRepository.create(createData);

      // Assert
      expect(prisma.table.create).toHaveBeenCalledWith({
        data: createData
      });
      expect(result).toEqual(mockTable);
    });
  });

  describe('update', () => {
    it('should update table', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      const mockTable = createMockTable({ id: 1, name: 'Updated Name' });
      vi.mocked(prisma.table.update).mockResolvedValue(mockTable);

      // Act
      const result = await tableRepository.update(1, updateData);

      // Assert
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(result).toEqual(mockTable);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a table', async () => {
      const mockTable = createMockTable({ deletedAt: new Date() });
      vi.mocked(prisma.table.update).mockResolvedValue(mockTable);

      const result = await tableRepository.softDelete(1);

      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          deletedAt: expect.any(Date),
          isAvailable: false,
          isOccupied: false
        }
      });
      expect(result).toEqual(mockTable);
    });
  });

  describe('updateOccupiedStatus', () => {
    it('should update occupied status to true', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isOccupied: true });
      vi.mocked(prisma.table.update).mockResolvedValue(mockTable);

      // Act
      const result = await tableRepository.updateOccupiedStatus(1, true);

      // Assert
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isOccupied: true }
      });
      expect(result).toEqual(mockTable);
    });

    it('should update occupied status to false', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isOccupied: false });
      vi.mocked(prisma.table.update).mockResolvedValue(mockTable);

      // Act
      const result = await tableRepository.updateOccupiedStatus(1, false);

      // Assert
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isOccupied: false }
      });
      expect(result).toEqual(mockTable);
    });
  });

  describe('updateCallStaffStatus', () => {
    it('should update call staff status to true', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isCallingStaff: true });
      vi.mocked(prisma.table.update).mockResolvedValue(mockTable);

      // Act
      const result = await tableRepository.updateCallStaffStatus(1, true);

      // Assert
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isCallingStaff: true }
      });
      expect(result).toEqual(mockTable);
    });

    it('should update call staff status to false', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isCallingStaff: false });
      vi.mocked(prisma.table.update).mockResolvedValue(mockTable);

      // Act
      const result = await tableRepository.updateCallStaffStatus(1, false);

      // Assert
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isCallingStaff: false }
      });
      expect(result).toEqual(mockTable);
    });
  });
});
