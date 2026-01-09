/**
 * @file Table Controller Tests
 * @description Unit tests for table HTTP request handlers
 * 
 * Tests cover:
 * - getTablesStatus() - all tables with status
 * - getTableById() - single table retrieval
 * - getTableDetails() - detailed table info
 * - updateTable() - table name updates
 * - toggleAvailability() - availability toggle
 * - updateCallStaff() - call staff status with Socket.IO
 * 
 * Best Practices:
 * - Mock Prisma directly (no service layer)
 * - Mock Socket.IO namespaces
 * - Test HTTP status codes
 * - Test response formats
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  getTablesStatus,
  getTableById,
  getTableDetails,
  updateTable,
  toggleAvailability,
  updateCallStaff
} from '../../../api/controllers/tableController.js';
import prisma from '../../../database/client/prisma.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

// Mock Prisma client
vi.mock('../../../database/client/prisma.js', () => ({
  default: {
    table: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('TableController', () => {
  let mockAuthenticatedNs: any;
  let mockPublicNs: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Socket.IO namespace mocks
    mockAuthenticatedNs = {
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
    };

    mockPublicNs = {
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
    };
  });

  describe('getTablesStatus', () => {
    it('should return all tables with status and 200 status', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const mockTables = [
        {
          id: 1,
          name: 'A1',
          isOccupied: true,
          isAvailable: true,
          isCallingStaff: false,
          orders: []
        },
        {
          id: 2,
          name: 'A2',
          isOccupied: false,
          isAvailable: true,
          isCallingStaff: false,
          orders: []
        }
      ];

      vi.mocked(prisma.table.findMany).mockResolvedValue(mockTables as any);

      // Act
      await getTablesStatus(req as Request, res as Response);

      // Assert
      expect(prisma.table.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null
        },
        orderBy: { name: 'asc' },
        include: {
          orders: {
            where: {
              status: { not: 'COMPLETED' }
            },
            include: {
              items: {
                include: { menu: true }
              }
            }
          }
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should calculate total amount for each table', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const mockTables = [
        {
          id: 1,
          name: 'A1',
          isOccupied: true,
          isAvailable: true,
          isCallingStaff: false,
          orders: [
            {
              id: 1,
              status: 'PENDING',
              items: [
                {
                  id: 1,
                  quantity: 2,
                  status: 'PENDING',
                  menu: { price: 50 }
                }
              ]
            }
          ]
        }
      ];

      vi.mocked(prisma.table.findMany).mockResolvedValue(mockTables as any);

      // Act
      await getTablesStatus(req as Request, res as Response);

      // Assert
      const responseData = (res.json as any).mock.calls[0][0].data;
      expect(responseData[0].totalAmount).toBe(100); // 50 * 2
    });
  });

  describe('getTableById', () => {
    it('should return table by id with 200 status', async () => {
      // Arrange
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();
      const mockTable = {
        id: 1,
        name: 'A1',
        isOccupied: false,
        isAvailable: true
      };

      vi.mocked(prisma.table.findUnique).mockResolvedValue(mockTable as any);

      // Act
      await getTableById(req as Request, res as Response);

      // Assert
      expect(prisma.table.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTable
      });
    });

    it('should return 404 if table not found', async () => {
      // Arrange
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      vi.mocked(prisma.table.findUnique).mockResolvedValue(null);

      // Act
      await getTableById(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Table not found',
        code: 'Table not found',
      });
    });
  });

  describe('getTableDetails', () => {
    it('should return table details with items', async () => {
      // Arrange
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();
      const mockTable = {
        id: 1,
        name: 'A1',
        orders: [
          {
            id: 1,
            items: [
              {
                id: 1,
                quantity: 2,
                status: 'PENDING',
                note: null,
                menu: {
                  nameTH: 'ข้าวผัด',
                  price: 50
                }
              }
            ]
          }
        ]
      };

      vi.mocked(prisma.table.findFirst).mockResolvedValue(mockTable as any);

      // Act
      await getTableDetails(req as Request, res as Response);

      // Assert
      expect(prisma.table.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        include: {
          orders: {
            where: { status: { notIn: ['COMPLETED'] } },
            include: { items: { include: { menu: true } } }
          }
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if table not found', async () => {
      // Arrange
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      vi.mocked(prisma.table.findFirst).mockResolvedValue(null);

      // Act
      await getTableDetails(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateTable', () => {
    it('should update table name with 200 status', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { name: 'Updated Table' }
      });
      const res = mockResponse();
      const mockTable = { id: 1, name: 'Updated Table' };

      vi.mocked(prisma.table.update).mockResolvedValue(mockTable as any);

      // Act
      await updateTable(req as Request, res as Response);

      // Assert
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Table' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTable
      });
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle availability to false', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { isAvailable: false }
      });
      const res = mockResponse();
      const mockTable = { id: 1, isAvailable: false };

      vi.mocked(prisma.table.update).mockResolvedValue(mockTable as any);

      // Act
      await toggleAvailability(req as Request, res as Response);

      // Assert
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isAvailable: false }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTable
      });
    });

    it('should toggle availability to true', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { isAvailable: true }
      });
      const res = mockResponse();
      const mockTable = { id: 1, isAvailable: true };

      vi.mocked(prisma.table.update).mockResolvedValue(mockTable as any);

      // Act
      await toggleAvailability(req as Request, res as Response);

      // Assert
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isAvailable: true }
      });
    });
  });

  describe('updateCallStaff', () => {
    it('should update call staff status with 200 status', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { isCalling: true },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockTable = {
        id: 1,
        isCallingStaff: true,
        orders: []
      };

      vi.mocked(prisma.table.update).mockResolvedValue(mockTable as any);

      // Act
      await updateCallStaff(req as Request, res as Response);

      // Assert
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isCallingStaff: true },
        include: {
          orders: {
            where: { status: { not: 'COMPLETED' } }
          }
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should broadcast to authenticated namespace', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '1' },
        body: { isCalling: true },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockTable = {
        id: 1,
        isCallingStaff: true,
        orders: []
      };

      vi.mocked(prisma.table.update).mockResolvedValue(mockTable as any);

      // Act
      await updateCallStaff(req as Request, res as Response);

      // Assert
      expect(mockAuthenticatedNs.emit).toHaveBeenCalledWith('table_updated', {
        ...mockTable,
        isOccupied: false
      });
    });

    it('should notify customer at table', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: '5' },
        body: { isCalling: false },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockTable = {
        id: 5,
        isCallingStaff: false,
        orders: []
      };

      vi.mocked(prisma.table.update).mockResolvedValue(mockTable as any);

      // Act
      await updateCallStaff(req as Request, res as Response);

      // Assert
      expect(mockPublicNs.to).toHaveBeenCalledWith('table-5');
      expect(mockPublicNs.emit).toHaveBeenCalledWith('table_updated', {
        id: 5,
        isCallingStaff: false
      });
    });
  });
});
