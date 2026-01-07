/**
 * @file Bill Service Tests
 * @description Unit tests for bill API service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { billService } from '@/services/billService';

vi.mock('@/lib/utils', () => ({
  API_URL: 'http://localhost:3001',
  authFetch: vi.fn(),
}));

import { authFetch } from '@/lib/utils';

describe('BillService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBillByTable', () => {
    it('should fetch bill for specific table', async () => {
      const mockBill = { id: 1, tableId: 1, totalPrice: 500 };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockBill }),
      } as Response);

      await billService.getBillByTable(1);

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/bills/table/1');
    });
  });

  describe('checkout', () => {
    it('should process checkout with POST request', async () => {
      const tableId = 1;
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { id: 1 } }),
      } as Response);

      await billService.checkout(tableId);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/bills/checkout',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ tableId }),
        })
      );
    });
  });
});
