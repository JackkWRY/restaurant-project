/**
 * @file Bill Controller Tests
 * @description Unit tests for bill HTTP request handlers
 * 
 * Tests cover:
 * - getTableBill() - retrieve bill for table
 * - checkoutTable() - process checkout with Socket.IO broadcasts
 * 
 * Best Practices:
 * - Mock billService
 * - Mock Socket.IO namespaces
 * - Test HTTP status codes
 * - Test response formats
 * - Test real-time broadcasts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  getTableBill,
  checkoutTable
} from '../../../api/controllers/billController.js';
import { billService } from '../../../business/services/billService.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

// Mock bill service
vi.mock('../../../business/services/billService.js', () => ({
  billService: {
    getTableBill: vi.fn(),
    checkoutTable: vi.fn(),
  },
}));

describe('BillController', () => {
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

  describe('getTableBill', () => {
    it('should return table bill with 200 status', async () => {
      // Arrange
      const req = mockRequest({
        params: { tableId: '1' }
      });
      const res = mockResponse();
      const mockBill = {
        id: 1,
        tableId: 1,
        totalPrice: 500,
        orders: []
      };

      vi.mocked(billService.getTableBill).mockResolvedValue(mockBill as any);

      // Act
      await getTableBill(req as Request, res as Response, mockNext());

      // Assert
      expect(billService.getTableBill).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockBill
      });
    });

    it('should parse tableId parameter as number', async () => {
      // Arrange
      const req = mockRequest({
        params: { tableId: '5' }
      });
      const res = mockResponse();

      vi.mocked(billService.getTableBill).mockResolvedValue(null as any);

      // Act
      await getTableBill(req as Request, res as Response, mockNext());

      // Assert
      expect(billService.getTableBill).toHaveBeenCalledWith(5);
    });

    it('should return null when no active bill exists', async () => {
      // Arrange
      const req = mockRequest({
        params: { tableId: '1' }
      });
      const res = mockResponse();

      vi.mocked(billService.getTableBill).mockResolvedValue(null as any);

      // Act
      await getTableBill(req as Request, res as Response, mockNext());

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: null
      });
    });
  });

  describe('checkoutTable', () => {
    it('should checkout table with 200 status', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          tableId: 1,
          paymentMethod: 'cash'
        },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();
      const mockResult = {
        message: 'Checkout successful',
        billId: 1,
        total: 500
      };

      vi.mocked(billService.checkoutTable).mockResolvedValue(mockResult as any);

      // Act
      await checkoutTable(req as Request, res as Response, mockNext());

      // Assert
      expect(billService.checkoutTable).toHaveBeenCalledWith({
        tableId: 1,
        paymentMethod: 'cash'
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Checkout successful',
        billId: 1,
        total: 500
      });
    });

    it('should broadcast table update to authenticated namespace', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          tableId: 3,
          paymentMethod: 'cash'
        },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();

      vi.mocked(billService.checkoutTable).mockResolvedValue({
        message: 'Success'
      } as any);

      // Act
      await checkoutTable(req as Request, res as Response, mockNext());

      // Assert
      expect(mockAuthenticatedNs.emit).toHaveBeenCalledWith('table_updated', {
        id: 3,
        isOccupied: false
      });
    });

    it('should notify customer at table via public namespace', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          tableId: 5,
          paymentMethod: 'credit_card'
        },
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();

      vi.mocked(billService.checkoutTable).mockResolvedValue({
        message: 'Success'
      } as any);

      // Act
      await checkoutTable(req as Request, res as Response, mockNext());

      // Assert
      expect(mockPublicNs.to).toHaveBeenCalledWith('table-5');
      expect(mockPublicNs.emit).toHaveBeenCalledWith('table_updated', {
        id: 5,
        isOccupied: false
      });
    });

    it('should pass checkout data to service', async () => {
      // Arrange
      const checkoutData = {
        tableId: 2,
        paymentMethod: 'cash'
      };
      const req = mockRequest({
        body: checkoutData,
        app: {
          get: vi.fn((key: string) => {
            if (key === 'authenticatedNamespace') return mockAuthenticatedNs;
            if (key === 'publicNamespace') return mockPublicNs;
          })
        } as any
      });
      const res = mockResponse();

      vi.mocked(billService.checkoutTable).mockResolvedValue({
        message: 'Success'
      } as any);

      // Act
      await checkoutTable(req as Request, res as Response, mockNext());

      // Assert
      expect(billService.checkoutTable).toHaveBeenCalledWith(checkoutData);
    });
  });
});
