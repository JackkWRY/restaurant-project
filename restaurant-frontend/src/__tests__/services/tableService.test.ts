/**
 * @file Table Service Tests
 * @description Unit tests for table API service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tableService } from '@/services/tableService';

vi.mock('@/lib/utils', () => ({
  API_URL: 'http://localhost:3001',
  authFetch: vi.fn(),
}));

import { authFetch } from '@/lib/utils';

describe('TableService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTableStatus', () => {
    it('should fetch all table statuses', async () => {
      const mockTables = [{ id: 1, name: 'A1', isOccupied: false }];
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockTables }),
      } as Response);

      await tableService.getTableStatus();

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/tables/status');
    });
  });

  describe('getTableDetails', () => {
    it('should fetch table details by id', async () => {
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: {} }),
      } as Response);

      await tableService.getTableDetails(1);

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/tables/1/details');
    });
  });

  describe('getTableById', () => {
    it('should fetch single table by id', async () => {
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { id: 1 } }),
      } as Response);

      await tableService.getTableById(1);

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/tables/1');
    });
  });

  describe('createTable', () => {
    it('should create table with POST request', async () => {
      const tableName = 'B1';
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { id: 1, name: tableName } }),
      } as Response);

      await tableService.createTable(tableName);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/tables',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: tableName }),
        })
      );
    });
  });

  describe('updateTable', () => {
    it('should update table name', async () => {
      const newName = 'C1';
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success' }),
      } as Response);

      await tableService.updateTable(1, newName);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/tables/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: newName }),
        })
      );
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle table availability', async () => {
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success' }),
      } as Response);

      await tableService.toggleAvailability(1, false);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/tables/1/availability',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ isAvailable: false }),
        })
      );
    });
  });

  describe('callStaff', () => {
    it('should update call staff status', async () => {
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success' }),
      } as Response);

      await tableService.callStaff(1, true);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/tables/1/call',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ isCalling: true }),
        })
      );
    });
  });
});
