/**
 * @file Table DTO Tests
 * @description Unit tests for Table DTOs
 * 
 * Tests cover:
 * - TableDto transformation from Prisma
 * - Field mapping
 * - Null handling for qrCode
 * - Boolean flags
 * - Array transformations
 * 
 * Best Practices:
 * - Test data transformation
 * - Test optional fields
 * - Test all boolean states
 */

import { describe, it, expect } from 'vitest';
import { TableDto } from '@/business/dtos/tableDto';
import { createMockTable } from '@/__tests__/helpers/testData';

describe('TableDto', () => {
  describe('fromPrisma', () => {
    it('should transform Prisma Table to TableDto', () => {
      // Arrange
      const mockTable = createMockTable({
        id: 1,
        name: 'A1',
        qrCode: 'https://example.com/qr/1',
        isOccupied: true,
        isAvailable: false,
        isCallingStaff: true,
      });

      // Act
      const result = TableDto.fromPrisma(mockTable);

      // Assert
      expect(result).toBeInstanceOf(TableDto);
      expect(result.id).toBe(1);
      expect(result.name).toBe('A1');
      expect(result.qrCode).toBe('https://example.com/qr/1');
      expect(result.isOccupied).toBe(true);
      expect(result.isAvailable).toBe(false);
      expect(result.isCallingStaff).toBe(true);
    });

    it('should handle null qrCode', () => {
      // Arrange
      const mockTable = createMockTable({
        qrCode: null,
      });

      // Act
      const result = TableDto.fromPrisma(mockTable);

      // Assert
      expect(result.qrCode).toBeNull();
    });

    it('should handle all boolean flags as false', () => {
      // Arrange
      const mockTable = createMockTable({
        isOccupied: false,
        isAvailable: false,
        isCallingStaff: false,
      });

      // Act
      const result = TableDto.fromPrisma(mockTable);

      // Assert
      expect(result.isOccupied).toBe(false);
      expect(result.isAvailable).toBe(false);
      expect(result.isCallingStaff).toBe(false);
    });

    it('should handle all boolean flags as true', () => {
      // Arrange
      const mockTable = createMockTable({
        isOccupied: true,
        isAvailable: true,
        isCallingStaff: true,
      });

      // Act
      const result = TableDto.fromPrisma(mockTable);

      // Assert
      expect(result.isOccupied).toBe(true);
      expect(result.isAvailable).toBe(true);
      expect(result.isCallingStaff).toBe(true);
    });
  });

  describe('fromPrismaMany', () => {
    it('should transform array of Prisma Tables to TableDtos', () => {
      // Arrange
      const mockTables = [
        createMockTable({ id: 1, name: 'A1' }),
        createMockTable({ id: 2, name: 'A2' }),
        createMockTable({ id: 3, name: 'B1' }),
      ];

      // Act
      const result = TableDto.fromPrismaMany(mockTables);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(TableDto);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('A1');
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should handle empty array', () => {
      // Arrange
      const mockTables: any[] = [];

      // Act
      const result = TableDto.fromPrismaMany(mockTables);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
