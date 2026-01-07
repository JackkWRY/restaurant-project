/**
 * @file Test Setup Configuration
 * @description Global test setup for Vitest
 * 
 * This file runs before each test file and sets up:
 * - Environment variables for testing
 * - Global test utilities
 * - Mock cleanup
 * 
 * Best Practices:
 * - Set test environment variables
 * - Keep setup minimal and fast
 * - Use beforeEach/afterEach for test isolation
 */

import { beforeEach } from 'vitest';

// ============================================
// Environment Variables
// ============================================

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-must-be-at-least-32-characters-long-for-security';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-must-be-32-chars-long-minimum';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.PORT = '3001';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// ============================================
// Global Test Hooks
// ============================================

beforeEach(() => {
  // Clear all mocks before each test for isolation
  // This is automatically done by Vitest when using vi.clearAllMocks()
});
