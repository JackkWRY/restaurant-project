/**
 * @file Settings Service Tests
 * @description Unit tests for settings API service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { settingsService } from '@/services/settingsService';

vi.mock('@/lib/utils', () => ({
  API_URL: 'http://localhost:3001',
  authFetch: vi.fn(),
}));

import { authFetch } from '@/lib/utils';

describe('SettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRestaurantName', () => {
    it('should fetch restaurant name', async () => {
      const mockName = 'My Restaurant';
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockName }),
      } as Response);

      await settingsService.getRestaurantName();

      expect(authFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/settings/name');
    });
  });

  describe('updateRestaurantName', () => {
    it('should update restaurant name with POST request', async () => {
      const newName = 'Updated Restaurant';
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: { message: 'Updated' } }),
      } as Response);

      await settingsService.updateRestaurantName(newName);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/settings/name',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: newName }),
        })
      );
    });
  });
});
