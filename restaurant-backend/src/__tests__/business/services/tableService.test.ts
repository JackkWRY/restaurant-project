/**
 * @file Table Service Tests
 * @description Unit tests for table management business logic
 * 
 * Tests cover:
 * - getAllTables retrieval
 * - getTableById with validation
 * - updateTableStatus (occupied/available)
 * - toggleStaffCall functionality
 * - Error handling and edge cases
 * 
 * Best Practices:
 * - Mock repository methods
 * - Test business logic
 * - Test error conditions
 * - Test state transitions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tableService } from '@/business/services/tableService';
import { createMockTable } from '@/__tests__/helpers/testData';
import { NotFoundError } from '@/core/errors/AppError';

// Mock repositories
vi.mock('@/database/repositories/tableRepository', () => ({
  tableRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    update: vi.fn(),
    updateCallStaffStatus: vi.fn(),
  },
}));

import { tableRepository } from '@/database/repositories/tableRepository';

describe('TableService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllTables', () => {
    it('should return all tables', async () => {
      // Arrange
      const mockTables = [
        createMockTable({ id: 1, name: 'Table 1' }),
        createMockTable({ id: 2, name: 'Table 2' }),
        createMockTable({ id: 3, name: 'Table 3' }),
      ];

      vi.mocked(tableRepository.findAll).mockResolvedValue(mockTables);

      // Act
      const result = await tableService.getTables();

      // Assert
      expect(tableRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(3);
    });

    it('should return empty array if no tables exist', async () => {
      // Arrange
      vi.mocked(tableRepository.findAll).mockResolvedValue([]);

      // Act
      const result = await tableService.getTables();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getTableById', () => {
    it('should return table by id', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, name: 'Table 1' });
      vi.mocked(tableRepository.findById).mockResolvedValue(mockTable);

      // Act
      const result = await tableService.getTableById(1);

      // Assert
      expect(tableRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Table 1');
    });

    it('should throw NotFoundError if table does not exist', async () => {
      // Arrange
      vi.mocked(tableRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(tableService.getTableById(999)).rejects.toThrow(NotFoundError);
      await expect(tableService.getTableById(999)).rejects.toThrow('Table not found');
    });
  });

  describe('updateTable', () => {
    it('should update table successfully', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, name: 'Table 1' });
      const updatedTable = createMockTable({ id: 1, name: 'Updated Table' });

      vi.mocked(tableRepository.findById).mockResolvedValue(mockTable);
      vi.mocked(tableRepository.findByName).mockResolvedValue(null); // No duplicate
      vi.mocked(tableRepository.update).mockResolvedValue(updatedTable);

      // Act
      const result = await tableService.updateTable(1, { name: 'Updated Table' });

      // Assert
      expect(tableRepository.findById).toHaveBeenCalledWith(1);
      expect(tableRepository.update).toHaveBeenCalledWith(1, { name: 'Updated Table' });
      expect(result).toHaveProperty('name', 'Updated Table');
    });

    it('should throw NotFoundError if table does not exist', async () => {
      // Arrange
      vi.mocked(tableRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(tableService.updateTable(999, { name: 'Test' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle availability from false to true', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isAvailable: false });
      const updatedTable = createMockTable({ id: 1, isAvailable: true });

      vi.mocked(tableRepository.findById).mockResolvedValue(mockTable);
      vi.mocked(tableRepository.update).mockResolvedValue(updatedTable);

      // Act
      const result = await tableService.toggleAvailability(1);

      // Assert
      expect(tableRepository.update).toHaveBeenCalledWith(1, { isAvailable: true });
      expect(result).toHaveProperty('isAvailable', true);
    });

    it('should toggle availability from true to false', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isAvailable: true });
      const updatedTable = createMockTable({ id: 1, isAvailable: false });

      vi.mocked(tableRepository.findById).mockResolvedValue(mockTable);
      vi.mocked(tableRepository.update).mockResolvedValue(updatedTable);

      // Act
      const result = await tableService.toggleAvailability(1);

      // Assert
      expect(result).toHaveProperty('isAvailable', false);
    });
  });

  describe('updateCallStaffStatus', () => {
    it('should update call staff status to true', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isCallingStaff: false });
      const updatedTable = createMockTable({ id: 1, isCallingStaff: true });

      vi.mocked(tableRepository.findById).mockResolvedValue(mockTable);
      vi.mocked(tableRepository.updateCallStaffStatus).mockResolvedValue(updatedTable);

      // Act
      const result = await tableService.updateCallStaffStatus(1, true);

      // Assert
      expect(tableRepository.findById).toHaveBeenCalledWith(1);
      expect(tableRepository.updateCallStaffStatus).toHaveBeenCalledWith(1, true);
      expect(result).toHaveProperty('isCallingStaff', true);
    });

    it('should update call staff status to false', async () => {
      // Arrange
      const mockTable = createMockTable({ id: 1, isCallingStaff: true });
      const updatedTable = createMockTable({ id: 1, isCallingStaff: false });

      vi.mocked(tableRepository.findById).mockResolvedValue(mockTable);
      vi.mocked(tableRepository.updateCallStaffStatus).mockResolvedValue(updatedTable);

      // Act
      const result = await tableService.updateCallStaffStatus(1, false);

      // Assert
      expect(result).toHaveProperty('isCallingStaff', false);
    });

    it('should throw NotFoundError if table does not exist', async () => {
      // Arrange
      vi.mocked(tableRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(tableService.updateCallStaffStatus(999, true)).rejects.toThrow(NotFoundError);
    });
  });
});
