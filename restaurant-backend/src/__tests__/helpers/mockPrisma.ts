/**
 * @file Mock Prisma Client
 * @description Mocked Prisma client for testing
 * 
 * This module provides a mocked Prisma client that can be used in tests
 * to avoid hitting the real database.
 * 
 * Usage:
 * ```typescript
 * import { prismaMock } from '@/__tests__/helpers/mockPrisma';
 * 
 * prismaMock.menu.findMany.mockResolvedValue([...]);
 * ```
 * 
 * Best Practices:
 * - Reset mocks between tests
 * - Use mockResolvedValue for async operations
 * - Type your mock data properly
 */

import { PrismaClient } from '@prisma/client';
import { beforeEach, vi } from 'vitest';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

// Create deep mock of Prisma Client
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Reset all mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Export for use in tests
export default prismaMock;
