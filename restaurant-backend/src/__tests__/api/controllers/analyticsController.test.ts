/**
 * @file Analytics Controller Tests
 * @description Unit tests for analytics HTTP request handlers
 * 
 * Tests cover:
 * - getAnalyticsSummary() - sales trends and top items
 * - getDailyBills() - today's bills
 * - getBillHistory() - paginated bill history with date filtering
 * 
 * Best Practices:
 * - Mock Prisma aggregations
 * - Mock dayjs for date consistency
 * - Test data transformations
 * - Test pagination
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  getAnalyticsSummary,
  getDailyBills,
  getBillHistory
} from '../../../api/controllers/analyticsController.js';
import prisma from '../../../database/client/prisma.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

// Mock Prisma client
vi.mock('../../../database/client/prisma.js', () => ({
  default: {
    bill: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    orderItem: {
      groupBy: vi.fn(),
    },
    menu: {
      findMany: vi.fn(),
    },
  },
}));

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = (date?: any) => {
    const baseDate = new Date('2024-01-15T10:00:00Z');
    return {
      startOf: vi.fn().mockReturnThis(),
      endOf: vi.fn().mockReturnThis(),
      subtract: vi.fn().mockReturnThis(),
      format: vi.fn((fmt: string) => {
        if (fmt === 'YYYY-MM-DD') return '2024-01-15';
        if (fmt === 'DD/MM') return '15/01';
        return '2024-01-15';
      }),
      toDate: vi.fn(() => baseDate),
    };
  };
  mockDayjs.default = mockDayjs;
  return { default: mockDayjs };
});

describe('AnalyticsController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAnalyticsSummary', () => {
    it('should return analytics summary with 200 status', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      vi.mocked(prisma.bill.aggregate).mockResolvedValue({
        _sum: { totalPrice: 5000 },
        _count: { id: 10 }
      } as any);

      vi.mocked(prisma.bill.findMany).mockResolvedValue([
        { closedAt: new Date(), totalPrice: 500 }
      ] as any);

      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([
        { menuId: 1, _sum: { quantity: 50 } }
      ] as any);

      vi.mocked(prisma.menu.findMany).mockResolvedValue([
        { id: 1, nameTH: 'ข้าวผัด' }
      ] as any);

      // Act
      await getAnalyticsSummary(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          todayTotal: expect.any(Number),
          todayCount: expect.any(Number),
          salesTrend: expect.any(Array),
          topItems: expect.any(Array)
        })
      });
    });

    it('should aggregate today sales correctly', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      vi.mocked(prisma.bill.aggregate).mockResolvedValue({
        _sum: { totalPrice: 3500 },
        _count: { id: 7 }
      } as any);

      vi.mocked(prisma.bill.findMany).mockResolvedValue([] as any);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([] as any);
      vi.mocked(prisma.menu.findMany).mockResolvedValue([] as any);

      // Act
      await getAnalyticsSummary(req as Request, res as Response);

      // Assert
      expect(prisma.bill.aggregate).toHaveBeenCalledWith({
        _sum: { totalPrice: true },
        _count: { id: true },
        where: {
          closedAt: { gte: expect.any(Date) },
          status: 'PAID'
        }
      });
    });

    it('should return top 5 items', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      vi.mocked(prisma.bill.aggregate).mockResolvedValue({
        _sum: { totalPrice: 0 },
        _count: { id: 0 }
      } as any);

      vi.mocked(prisma.bill.findMany).mockResolvedValue([] as any);

      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([
        { menuId: 1, _sum: { quantity: 50 } },
        { menuId: 2, _sum: { quantity: 40 } },
        { menuId: 3, _sum: { quantity: 30 } }
      ] as any);

      vi.mocked(prisma.menu.findMany).mockResolvedValue([
        { id: 1, nameTH: 'ข้าวผัด' },
        { id: 2, nameTH: 'ผัดไทย' },
        { id: 3, nameTH: 'ส้มตำ' }
      ] as any);

      // Act
      await getAnalyticsSummary(req as Request, res as Response);

      // Assert
      expect(prisma.orderItem.groupBy).toHaveBeenCalledWith({
        by: ['menuId'],
        _sum: { quantity: true },
        where: { status: { not: 'CANCELLED' } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      });
    });
  });

  describe('getDailyBills', () => {
    it('should return today bills with 200 status', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      vi.mocked(prisma.bill.findMany).mockResolvedValue([
        {
          id: 1,
          tableId: 1,
          status: 'PAID',
          totalPrice: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
          table: { name: 'A1' },
          orders: [
            {
              items: [
                {
                  id: 1,
                  quantity: 2,
                  status: 'COMPLETED',
                  note: null,
                  menu: { nameTH: 'ข้าวผัด', price: 50 }
                }
              ]
            }
          ]
        }
      ] as any);

      // Act
      await getDailyBills(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            status: expect.any(String),
            totalPrice: expect.any(Number),
            items: expect.any(Array)
          })
        ])
      });
    });

    it('should filter bills by today date', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      vi.mocked(prisma.bill.findMany).mockResolvedValue([] as any);

      // Act
      await getDailyBills(req as Request, res as Response);

      // Assert
      expect(prisma.bill.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { createdAt: { gte: expect.any(Date) } },
            { closedAt: { gte: expect.any(Date) } }
          ]
        },
        include: expect.any(Object),
        orderBy: { updatedAt: 'desc' }
      });
    });
  });

  describe('getBillHistory', () => {
    it('should return paginated bill history', async () => {
      // Arrange
      const req = mockRequest({
        query: { page: '1', limit: '10' }
      });
      const res = mockResponse();

      vi.mocked(prisma.bill.findMany).mockResolvedValue([
        {
          id: 1,
          closedAt: new Date(),
          totalPrice: 500,
          paymentMethod: 'CASH',
          table: { name: 'A1' },
          orders: [
            {
              items: [
                {
                  id: 1,
                  quantity: 2,
                  status: 'COMPLETED',
                  note: null,
                  menu: { nameTH: 'ข้าวผัด', price: 50 }
                }
              ]
            }
          ]
        }
      ] as any);

      vi.mocked(prisma.bill.count).mockResolvedValue(25);

      vi.mocked(prisma.bill.aggregate).mockResolvedValue({
        _sum: { totalPrice: 12500 }
      } as any);

      // Act
      await getBillHistory(req as Request, res as Response);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          summary: {
            totalSales: 12500,
            billCount: 25
          },
          bills: expect.any(Array)
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      });
    });

    it('should use default pagination values', async () => {
      // Arrange
      const req = mockRequest({ query: {} });
      const res = mockResponse();

      vi.mocked(prisma.bill.findMany).mockResolvedValue([] as any);
      vi.mocked(prisma.bill.count).mockResolvedValue(0);
      vi.mocked(prisma.bill.aggregate).mockResolvedValue({
        _sum: { totalPrice: 0 }
      } as any);

      // Act
      await getBillHistory(req as Request, res as Response);

      // Assert
      const call = vi.mocked(prisma.bill.findMany).mock.calls[0][0];
      expect(call?.skip).toBe(0);
      expect(call?.take).toBe(20);
    });

    it('should filter by date range', async () => {
      // Arrange
      const req = mockRequest({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      });
      const res = mockResponse();

      vi.mocked(prisma.bill.findMany).mockResolvedValue([] as any);
      vi.mocked(prisma.bill.count).mockResolvedValue(0);
      vi.mocked(prisma.bill.aggregate).mockResolvedValue({
        _sum: { totalPrice: 0 }
      } as any);

      // Act
      await getBillHistory(req as Request, res as Response);

      // Assert
      const call = vi.mocked(prisma.bill.findMany).mock.calls[0][0];
      expect(call?.where).toEqual({
        status: 'PAID',
        closedAt: {
          gte: expect.any(Date),
          lte: expect.any(Date)
        }
      });
    });
  });
});
