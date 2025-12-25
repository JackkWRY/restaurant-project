import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get token from localStorage
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Authenticated fetch wrapper
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, { ...options, headers });
};

// Authenticated fetcher for SWR
export const authFetcher = async (url: string) => {
  const token = getToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, { headers });
  
  if (!res.ok) {
    if (res.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/th/login';
      }
    }
    throw new Error('API Error');
  }
  
  return res.json();
};

// Regular fetcher (no auth)
export const fetcher = (url: string) => fetch(url).then((res) => res.json());