/**
 * @file Auth Service Tests
 * @description Unit tests for authentication API service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '@/services/authService';

vi.mock('@/lib/utils', () => ({
  API_URL: 'http://localhost:3001',
  authFetch: vi.fn(),
}));

import { authFetch } from '@/lib/utils';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login with username and password', async () => {
      const credentials = { username: 'admin', password: 'password123' };
      const mockResponse = { 
        accessToken: 'token123', 
        refreshToken: 'refresh123',
        user: { id: 1, username: 'admin' }
      };
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success', data: mockResponse }),
      } as Response);

      const result = await authService.login(credentials.username, credentials.password);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(credentials),
        })
      );
      expect(result.status).toBe('success');
    });
  });

  describe('logout', () => {
    it('should logout with refresh token', async () => {
      const refreshToken = 'refresh123';
      vi.mocked(authFetch).mockResolvedValue({
        json: async () => ({ status: 'success' }),
      } as Response);

      await authService.logout(refreshToken);

      expect(authFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/logout',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        })
      );
    });
  });
});
