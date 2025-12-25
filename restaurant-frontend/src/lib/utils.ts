import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get access token from localStorage
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Get refresh token from localStorage
export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

// Refresh access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (res.ok) {
      const data = await res.json();
      const newAccessToken = data.accessToken;
      
      // Save new access token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newAccessToken);
      }
      
      return newAccessToken;
    }
    
    // Refresh token expired or invalid
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

// Authenticated fetch wrapper with auto-refresh
export const authFetch = async (url: string, options: RequestInit = {}) => {
  let token = getToken();
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/th/login';
      }
    }
  }
  
  return res;
};

// Authenticated fetcher for SWR with auto-refresh
export const authFetcher = async (url: string) => {
  let token = getToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // First attempt
  let res = await fetch(url, { headers });
  
  // If 401, try to refresh token
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry with new token
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { headers });
    } else {
      // Refresh failed, redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/th/login';
      }
      throw new Error('Authentication failed');
    }
  }
  
  if (!res.ok) {
    throw new Error('API Error');
  }
  
  return res.json();
};

// Regular fetcher (no auth)
export const fetcher = (url: string) => fetch(url).then((res) => res.json());