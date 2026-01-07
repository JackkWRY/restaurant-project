/**
 * @file Analytics Service Tests
 * @description Unit tests for analytics API service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsService } from '@/services/analyticsService';

vi.mock('@/lib/utils', () => ({
  API_URL: 'http://localhost:3001',
  authFetch: vi.fn(),
}));

import { authFetch } from '@/lib/utils';

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHistory', () => {
    it('should fetch bill history with date range and pagination', async () => {
      const mockData = {
        summary: { totalSales: 5000, billCount: 10 },
        bills: [],
        pagination: { page: 1, limit: 20, total: 10, totalPages: 1 }
      };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockData }),
      } as Response);

      await analyticsService.getHistory('2024-01-01', '2024-01-31', 1, 20);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analytics/history?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20'
      );
    });
  });
});
