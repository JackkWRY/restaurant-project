import { ApiService } from './api';

/**
 * Bill Service
 * 
 * Handles all bill-related API operations including:
 * - Fetching table bills
 * - Processing checkout
 */
class BillService extends ApiService {
  /**
   * Get bill for a specific table
   */
  async getTableBill(tableId: number) {
    return this.get(`/api/bills/table/${tableId}`);
  }

  /**
   * Process checkout for a table
   */
  async checkout(tableId: number) {
    return this.post('/api/bills/checkout', { tableId });
  }
}

export const billService = new BillService();
