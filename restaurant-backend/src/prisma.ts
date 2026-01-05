/**
 * @file Prisma Database Client
 * @description Singleton Prisma Client instance for database operations
 * 
 * This module provides:
 * - Centralized Prisma Client instance
 * - Connection pooling management
 * - Type-safe database access
 * 
 * @module config/prisma
 * @requires @prisma/client
 * 
 * @see {@link https://www.prisma.io/docs/concepts/components/prisma-client}
 */

import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton instance
 * Provides type-safe database access across the application
 */
const prisma = new PrismaClient();

export default prisma;