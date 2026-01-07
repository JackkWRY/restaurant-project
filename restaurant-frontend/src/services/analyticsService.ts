import { ApiService } from './api';

/**
 * Analytics Service
 * 
 * Handles all analytics-related API operations including:
 * - Fetching bill history with date range filtering
 * - Pagination support
 * - Summary statistics
 */
class AnalyticsService extends ApiService {
  /**
   * Get bill history with date range and pagination
   * 
   * @param startDate - Start date (YYYY-MM-DD format)
   * @param endDate - End date (YYYY-MM-DD format)
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   */
  async getHistory(startDate: string, endDate: string, page: number = 1, limit: number = 20) {
    return this.get<{
      summary: { totalSales: number; billCount: number };
      bills: Array<{
        id: string;
        date: string;
        tableName: string;
        total: number;
        paymentMethod: string;
        itemsCount: number;
        items: Array<{
          id: number;
          name: string;
          price: number;
          quantity: number;
          subtotal: number;
          status: string;
          note: string | null;
        }>;
      }>;
      pagination?: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/v1/analytics/history?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`);
  }
}

export const analyticsService = new AnalyticsService();
