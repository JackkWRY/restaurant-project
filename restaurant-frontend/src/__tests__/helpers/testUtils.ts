/**
 * Common Test Utilities
 * 
 * Provides utility functions for testing.
 */

import { vi } from 'vitest';

/**
 * Wait for a specific amount of time
 * Useful for testing async operations
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock fetch response
 */
export const createMockResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

/**
 * Mock fetch error
 */
export const createMockError = (message: string) => {
  throw new Error(message);
};

/**
 * Create mock event
 */
export const createMockEvent = (type: string, data: Record<string, unknown> = {}) => ({
  type,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  ...data,
});
