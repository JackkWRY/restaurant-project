import { ApiService } from './api';

/**
 * Auth Service
 * 
 * Handles all authentication-related API operations including:
 * - User login
 * - User logout
 */
class AuthService extends ApiService {
  /**
   * Login user with username and password
   */
  async login(username: string, password: string) {
    return this.post('/api/v1/login', { username, password });
  }

  /**
   * Logout user and invalidate refresh token
   */
  async logout(refreshToken: string) {
    return this.post('/api/v1/logout', { refreshToken });
  }
}

export const authService = new AuthService();
