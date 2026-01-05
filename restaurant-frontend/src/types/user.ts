/**
 * @file User Type Definitions
 * @description Type definitions for users and authentication
 * 
 * This module provides:
 * - User interface for user data
 * - AuthResponse interface for login response
 * - LoginCredentials interface for login form
 * 
 * @module types/user
 * 
 * @see {@link components/common/LoginForm} for usage
 */

// User-related types

export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'STAFF' | 'KITCHEN';
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}
