/**
 * @file Bill Repository Tests
 * @description Unit tests for bill data access layer
 * 
 * Tests cover:
 * - findAll() with relations
 * - findById() single retrieval
 * - findActiveBillByTable() active bill lookup
 * - create() bill creation
 * - update() bill updates
 * - delete() bill deletion
 * - incrementTotal() atomic increment
 * 
 * Best Practices:
 * - Mock Prisma client
 * - Test method calls
 * - Test query parameters
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { billRepository } from '@/database/repositories/billRepository';
import prisma from '@/database/client/prisma';
import { createMockBill } from '@/__tests__/helpers/testData';
import { BillStatus } from '@/core/config/enums';

// Mock Prisma client
vi.mock('@/database/client/prisma', () => ({
  default: {
    bill: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('BillRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all bills with relations', async () => {
      // Arrange
      const mockBills = [createMockBill(), createMockBill()];
      vi.mocked(prisma.bill.findMany).mockResolvedValue(mockBills as any);

      // Act
      const result = await billRepository.findAll();

      // Assert
      expect(prisma.bill.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          table: true,
          orders: {
            include: {
              items: {
                include: { menu: true }
              }
            }
          }
        }
      });
      expect(result).toEqual(mockBills);
    });

    it('should find bills with filters', async () => {
      // Arrange
      const mockBills = [createMockBill()];
      const filters = { status: BillStatus.OPEN };
      vi.mocked(prisma.bill.findMany).mockResolvedValue(mockBills as any);

      // Act
      const result = await billRepository.findAll(filters);

      // Assert
      expect(prisma.bill.findMany).toHaveBeenCalledWith({
        where: filters,
        include: expect.any(Object)
      });
      expect(result).toEqual(mockBills);
    });
  });

  describe('findById', () => {
    it('should find bill by id with relations', async () => {
      // Arrange
      const mockBill = createMockBill({ id: 'bill-uuid-1' });
      vi.mocked(prisma.bill.findUnique).mockResolvedValue(mockBill as any);

      // Act
      const result = await billRepository.findById('bill-uuid-1');

      // Assert
      expect(prisma.bill.findUnique).toHaveBeenCalledWith({
        where: { id: 'bill-uuid-1' },
        include: {
          table: true,
          orders: {
            include: {
              items: {
                include: { menu: true }
              }
            }
          }
        }
      });
      expect(result).toEqual(mockBill);
    });

    it('should return null if bill not found', async () => {
      // Arrange
      vi.mocked(prisma.bill.findUnique).mockResolvedValue(null);

      // Act
      const result = await billRepository.findById('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findActiveBillByTable', () => {
    it('should find active bill by table id and status', async () => {
      // Arrange
      const mockBill = createMockBill({ tableId: 1, status: BillStatus.OPEN });
      vi.mocked(prisma.bill.findFirst).mockResolvedValue(mockBill as any);

      // Act
      const result = await billRepository.findActiveBillByTable(1, BillStatus.OPEN);

      // Assert
      expect(prisma.bill.findFirst).toHaveBeenCalledWith({
        where: {
          tableId: 1,
          status: BillStatus.OPEN
        },
        include: {
          table: true,
          orders: {
            include: {
              items: {
                include: { menu: true }
              }
            }
          }
        }
      });
      expect(result).toEqual(mockBill);
    });

    it('should return null if no active bill found', async () => {
      // Arrange
      vi.mocked(prisma.bill.findFirst).mockResolvedValue(null);

      // Act
      const result = await billRepository.findActiveBillByTable(1, BillStatus.OPEN);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create bill with relations', async () => {
      // Arrange
      const createData = {
        table: { connect: { id: 1 } },
        status: BillStatus.OPEN,
        totalPrice: 0
      };
      const mockBill = createMockBill();
      vi.mocked(prisma.bill.create).mockResolvedValue(mockBill as any);

      // Act
      const result = await billRepository.create(createData as any);

      // Assert
      expect(prisma.bill.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          table: true,
          orders: true
        }
      });
      expect(result).toEqual(mockBill);
    });
  });

  describe('update', () => {
    it('should update bill', async () => {
      // Arrange
      const updateData = { status: BillStatus.PAID };
      const mockBill = createMockBill({ status: BillStatus.PAID });
      vi.mocked(prisma.bill.update).mockResolvedValue(mockBill as any);

      // Act
      const result = await billRepository.update('bill-uuid-1', updateData);

      // Assert
      expect(prisma.bill.update).toHaveBeenCalledWith({
        where: { id: 'bill-uuid-1' },
        data: updateData
      });
      expect(result).toEqual(mockBill);
    });
  });

  describe('delete', () => {
    it('should delete bill', async () => {
      // Arrange
      const mockBill = createMockBill({ id: 'bill-uuid-1' });
      vi.mocked(prisma.bill.delete).mockResolvedValue(mockBill as any);

      // Act
      const result = await billRepository.delete('bill-uuid-1');

      // Assert
      expect(prisma.bill.delete).toHaveBeenCalledWith({
        where: { id: 'bill-uuid-1' }
      });
      expect(result).toEqual(mockBill);
    });
  });

  describe('incrementTotal', () => {
    it('should atomically increment bill total', async () => {
      // Arrange
      const mockBill = createMockBill();
      vi.mocked(prisma.bill.update).mockResolvedValue(mockBill as any);

      // Act
      const result = await billRepository.incrementTotal('bill-uuid-1', 50);

      // Assert
      expect(prisma.bill.update).toHaveBeenCalledWith({
        where: { id: 'bill-uuid-1' },
        data: {
          totalPrice: { increment: 50 }
        }
      });
      expect(result).toEqual(mockBill);
    });
  });
});
