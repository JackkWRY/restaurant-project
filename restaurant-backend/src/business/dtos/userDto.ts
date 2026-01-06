/**
 * @file User Data Transfer Objects
 * @description DTOs for user and authentication-related API responses
 * 
 * This file provides:
 * - UserDto: User information (password excluded)
 * - AuthResponseDto: Authentication response with tokens
 * - Security filtering (sensitive fields not exposed)
 * 
 * Property descriptions (UserDto):
 * - id: Unique user identifier
 * - username: User login username
 * - role: User role (ADMIN, STAFF, etc.)
 * - createdAt: Account creation timestamp
 * 
 * Property descriptions (AuthResponseDto):
 * - accessToken: JWT access token (short-lived)
 * - refreshToken: JWT refresh token (long-lived, optional)
 * - user: User information
 * 
 * Security:
 * - Password is NEVER exposed in DTOs
 * - updatedAt is internal field, not exposed
 * - Tokens are only included in auth responses
 * 
 * @module dtos/userDto
 * @requires @prisma/client
 * 
 * @see {@link ../controllers/authController.ts} for usage
 * @see {@link ../middlewares/authMiddleware.ts} for token validation
 */

import type { User } from '@prisma/client';

/**
 * User DTO (Data Transfer Object)
 * 
 * Controls what user data is exposed through the API.
 * CRITICAL: Never exposes password or sensitive fields.
 * 
 * @example
 * const userDto = UserDto.fromPrisma(user);
 * res.json({ status: 'success', data: userDto });
 */
export class UserDto {
  id: number;
  username: string;
  role: string;
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.role = user.role;
    this.createdAt = user.createdAt;

    // SECURITY: password is NOT exposed
    // SECURITY: updatedAt is NOT exposed (internal field)
  }

  /**
   * Convert single Prisma User to DTO
   */
  static fromPrisma(user: User): UserDto {
    return new UserDto(user);
  }

  /**
   * Convert array of Prisma Users to DTOs
   */
  static fromPrismaMany(users: User[]): UserDto[] {
    return users.map(user => new UserDto(user));
  }
}

/**
 * Auth Response DTO
 * 
 * For login/refresh token responses.
 * Includes JWT tokens and user information.
 * 
 * @example
 * const authResponse = new AuthResponseDto({
 *   accessToken: 'jwt...',
 *   refreshToken: 'jwt...',
 *   user: userFromDb
 * });
 * res.json({ status: 'success', data: authResponse });
 */
export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  user: UserDto;

  constructor(data: {
    accessToken: string;
    refreshToken?: string;
    user: User;
  }) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.user = new UserDto(data.user);
  }
}
