/**
 * @file API Service Layer
 * @description Centralized API service with common HTTP methods
 * 
 * This module provides:
 * - Base ApiService class with CRUD methods
 * - Type-safe API responses
 * - Authenticated request handling
 * - Reusable HTTP methods (GET, POST, PUT, DELETE)
 * 
 * Features:
 * - Generic response types
 * - Automatic authentication
 * - Error handling
 * - Extensible service pattern
 * 
 * @module services/api
 * @requires @/lib/utils
 * 
 * @see {@link utils} for authFetch implementation
 * 
 * @example
 * class UserService extends ApiService {
 *   async getUsers() {
 *     return this.get('/api/users');
 *   }
 * }
 */

// API service layer
// Centralized API calls for better organization and reusability

import { API_URL, authFetch } from '@/lib/utils';

/**
 * Generic API response type
 */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

/**
 * Base API service with common methods
 */
export class ApiService {
  protected baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Authenticated GET request
   */
  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await authFetch(`${this.baseUrl}${endpoint}`);
    return response.json();
  }

  /**
   * Authenticated POST request
   */
  protected async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await authFetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Authenticated PUT request
   */
  protected async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await authFetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Authenticated DELETE request
   */
  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await authFetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  /**
   * Authenticated PATCH request
   */
  protected async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await authFetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService();
