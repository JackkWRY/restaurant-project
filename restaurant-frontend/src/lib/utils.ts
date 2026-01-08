/**
 * @file Utility Functions
 * @description Common utility functions and API helpers
 * 
 * This module provides:
 * - Class name merging utilities (cn)
 * - Token management (get, refresh)
 * - Authenticated fetch wrapper (authFetch)
 * - SWR fetcher with auth (fetcher, authFetcher)
 * - Date formatting utilities
 * 
 * Features:
 * - Automatic token refresh on 401
 * - Type-safe API calls
 * - Tailwind CSS class merging
 * - SSR-safe localStorage access
 * 
 * @module lib/utils
 * @requires clsx
 * @requires tailwind-merge
 * @requires ./logger
 * 
 * @see {@link logger} for logging utilities
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { logger } from "./logger";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * API Version
 * Current API version for all endpoints
 */
export const API_VERSION = 'v1';

/**
 * Merges Tailwind CSS classes with clsx
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retrieves access token from localStorage
 * 
 * @returns Access token or null if not found or not in browser
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Retrieves refresh token from localStorage
 * 
 * @returns Refresh token or null if not found or not in browser
 */
export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

/**
 * Refreshes access token using refresh token
 * 
 * Attempts to get a new access token from the server using the refresh token.
 * Automatically saves the new token to localStorage on success.
 * 
 * @returns New access token or null if refresh failed
 * @private
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/${API_VERSION}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (res.ok) {
      const data = await res.json();
      // New response format: { status: 'success', data: { accessToken } }
      const newAccessToken = data.data?.accessToken || data.accessToken; // Fallback for compatibility
      
      // Save new access token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newAccessToken);
      }
      
      return newAccessToken;
    }
    
    // Refresh token expired or invalid
    return null;
  } catch (error) {
    logger.error('Token refresh failed:', error);
    return null;
  }
};

/**
 * Handle authentication failure by clearing storage and redirecting to login
 * @private
 */
const handleAuthFailure = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/th/login';
  }
};

/**
 * Core fetch with authentication and automatic token refresh
 * 
 * Features:
 * - Automatically adds Authorization header
 * - Retries request with refreshed token on 401
 * - Redirects to login if refresh fails
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Fetch response
 * @throws {Error} If authentication fails after token refresh
 * @private
 */
const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // First attempt
  let res = await fetch(url, { ...options, headers });
  
  // If 401, try to refresh token
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry with new token
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      // Refresh failed, redirect to login
      handleAuthFailure();
      throw new Error('Authentication failed');
    }
  }
  
  return res;
};

/**
 * Authenticated fetch wrapper
 * 
 * Wrapper around fetchWithAuth for backward compatibility.
 * Use this for general API calls that need authentication.
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Fetch response
 * 
 * @example
 * ```typescript
 * const res = await authFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) });
 * ```
 */
export const authFetch = fetchWithAuth;

/**
 * Authenticated fetcher for SWR with automatic token refresh
 * 
 * Designed for use with SWR's useSWR hook.
 * Automatically handles authentication and token refresh.
 * Uses the shared fetchWithAuth function for consistency.
 * 
 * @param url - API endpoint URL
 * @returns Parsed JSON response
 * @throws {Error} If authentication fails or API returns error
 * 
 * @example
 * ```typescript
 * const { data } = useSWR('/api/menus', authFetcher);
 * ```
 */
export const authFetcher = async (url: string) => {
  const res = await fetchWithAuth(url);
  
  if (!res.ok) {
    throw new Error('API Error');
  }
  
  return res.json();
};

/**
 * Simple fetcher for public endpoints (no authentication)
 * 
 * @param url - API endpoint URL
 * @returns Parsed JSON response
 */
export const fetcher = (url: string) => fetch(url).then((res) => res.json());