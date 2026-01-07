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
  async getBillByTable(tableId: number) {
    return this.get(`/api/v1/bills/table/${tableId}`);
  }

  /**
   * Checkout and close bill for a table
   */
  async checkout(tableId: number) {
    return this.post('/api/v1/bills/checkout', { tableId });
  }
}

export const billService = new BillService();
