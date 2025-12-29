import type { User } from '@prisma/client';

/**
 * User DTO (Data Transfer Object)
 * Controls what user data is exposed through the API
 * IMPORTANT: Never expose password or sensitive fields
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
 * For login/refresh responses
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
