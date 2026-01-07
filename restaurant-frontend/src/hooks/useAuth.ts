/**
 * @file useAuth Hook
 * @description Centralized authentication logic
 * 
 * This hook handles:
 * - User authentication state
 * - Token validation
 * - Auto-redirect to login if not authenticated
 * - Logout functionality
 * - User data parsing from localStorage
 * 
 * State management:
 * - Local state for user object
 * - Local state for loading indicator
 * 
 * Features:
 * - Auto-check token on mount
 * - Parse user data from localStorage
 * - Redirect to login if no token
 * - Clean logout with token removal
 * 
 * @module hooks/useAuth
 * @requires react
 * @requires next/navigation
 * @requires services/authService
 * 
 * @see {@link AdminDashboard} for usage example
 * @see {@link StaffDashboard} for usage example
 * @see {@link KitchenDashboard} for usage example
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { logger } from '@/lib/logger';

/**
 * User object interface
 * 
 * @property {number} id - User ID
 * @property {string} username - Username
 * @property {string} role - User role (admin, staff, kitchen)
 */
interface User {
  id: number;
  username: string;
  role: string;
}

/**
 * Return type for useAuth hook
 * 
 * @property {User | null} user - Current user object or null if not authenticated
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {boolean} isLoading - Whether auth check is in progress
 * @property {() => Promise<void>} logout - Logout function
 */
interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

/**
 * Authentication hook
 * 
 * Handles user authentication, token validation, and logout.
 * Automatically redirects to login if not authenticated.
 * 
 * @param {string} lang - Current language (th/en), defaults to 'th'
 * @returns {UseAuthReturn} Authentication state and logout function
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading, logout } = useAuth('th');
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (!isAuthenticated) return null; // Will redirect to login
 * 
 * return (
 *   <div>
 *     <p>Welcome, {user?.username}!</p>
 *     <p>Role: {user?.role}</p>
 *     <button onClick={logout}>Logout</button>
 *   </div>
 * );
 * ```
 */
export function useAuth(lang: string = 'th'): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // No token found, redirect to login
    if (!token) {
      router.push(`/${lang}/login`);
      setIsLoading(false);
      return;
    }

    // Parse user data from localStorage
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      } catch (e) {
        logger.error('Error parsing user data', e);
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, [lang, router]);

  /**
   * Logout function
   * 
   * Performs the following:
   * 1. Call logout API with refresh token
   * 2. Remove all auth-related data from localStorage
   * 3. Clear user state
   * 4. Redirect to login page
   * 
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      // Always clear local storage and redirect, even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      router.push(`/${lang}/login`);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
}
