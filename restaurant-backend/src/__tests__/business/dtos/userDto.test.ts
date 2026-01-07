/**
 * @file User DTO Tests
 * @description Unit tests for User and Auth DTOs
 * 
 * Tests cover:
 * - UserDto transformation from Prisma
 * - AuthResponseDto creation
 * - Security: password exclusion
 * - Field mapping
 * - Array transformations
 * 
 * Best Practices:
 * - Test data transformation
 * - Test security filtering
 * - Test sensitive field exclusion
 * - Test nested DTOs
 */

import { describe, it, expect } from 'vitest';
import { UserDto, AuthResponseDto } from '@/business/dtos/userDto';
import { createMockUser } from '@/__tests__/helpers/testData';

describe('UserDto', () => {
  describe('fromPrisma', () => {
    it('should transform Prisma User to UserDto', () => {
      // Arrange
      const mockUser = createMockUser({
        id: 1,
        username: 'admin',
        role: 'ADMIN',
      });

      // Act
      const result = UserDto.fromPrisma(mockUser);

      // Assert
      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBe(1);
      expect(result.username).toBe('admin');
      expect(result.role).toBe('ADMIN');
    });

    it('should include createdAt date', () => {
      // Arrange
      const createdDate = new Date('2024-01-01');
      const mockUser = createMockUser({
        createdAt: createdDate,
      });

      // Act
      const result = UserDto.fromPrisma(mockUser);

      // Assert
      expect(result.createdAt).toEqual(createdDate);
    });

    it('should NOT expose password field', () => {
      // Arrange
      const mockUser = createMockUser({
        password: 'hashed-password-123',
      });

      // Act
      const result = UserDto.fromPrisma(mockUser);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect((result as any).password).toBeUndefined();
    });

    it('should handle different roles', () => {
      // Arrange
      const mockAdmin = createMockUser({ role: 'ADMIN' });
      const mockStaff = createMockUser({ role: 'STAFF' });
      const mockKitchen = createMockUser({ role: 'KITCHEN' });

      // Act
      const adminDto = UserDto.fromPrisma(mockAdmin);
      const staffDto = UserDto.fromPrisma(mockStaff);
      const kitchenDto = UserDto.fromPrisma(mockKitchen);

      // Assert
      expect(adminDto.role).toBe('ADMIN');
      expect(staffDto.role).toBe('STAFF');
      expect(kitchenDto.role).toBe('KITCHEN');
    });
  });

  describe('fromPrismaMany', () => {
    it('should transform array of Prisma Users to UserDtos', () => {
      // Arrange
      const mockUsers = [
        createMockUser({ id: 1, username: 'admin' }),
        createMockUser({ id: 2, username: 'staff1' }),
        createMockUser({ id: 3, username: 'kitchen1' }),
      ];

      // Act
      const result = UserDto.fromPrismaMany(mockUsers);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(UserDto);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should handle empty array', () => {
      // Arrange
      const mockUsers: any[] = [];

      // Act
      const result = UserDto.fromPrismaMany(mockUsers);

      // Assert
      expect(result).toEqual([]);
    });

    it('should NOT expose passwords in array transformation', () => {
      // Arrange
      const mockUsers = [
        createMockUser({ password: 'hash1' }),
        createMockUser({ password: 'hash2' }),
      ];

      // Act
      const result = UserDto.fromPrismaMany(mockUsers);

      // Assert
      result.forEach(userDto => {
        expect(userDto).not.toHaveProperty('password');
        expect((userDto as any).password).toBeUndefined();
      });
    });
  });
});

describe('AuthResponseDto', () => {
  describe('constructor', () => {
    it('should create AuthResponseDto with tokens and user', () => {
      // Arrange
      const mockUser = createMockUser({
        id: 1,
        username: 'admin',
      });

      const authData = {
        accessToken: 'jwt-access-token-123',
        refreshToken: 'jwt-refresh-token-456',
        user: mockUser,
      };

      // Act
      const result = new AuthResponseDto(authData);

      // Assert
      expect(result.accessToken).toBe('jwt-access-token-123');
      expect(result.refreshToken).toBe('jwt-refresh-token-456');
      expect(result.user).toBeInstanceOf(UserDto);
      expect(result.user.id).toBe(1);
      expect(result.user.username).toBe('admin');
    });

    it('should handle optional refreshToken', () => {
      // Arrange
      const mockUser = createMockUser();
      const authData = {
        accessToken: 'jwt-access-token-123',
        user: mockUser,
      };

      // Act
      const result = new AuthResponseDto(authData);

      // Assert
      expect(result.accessToken).toBe('jwt-access-token-123');
      expect(result.refreshToken).toBeUndefined();
    });

    it('should NOT expose password in nested user', () => {
      // Arrange
      const mockUser = createMockUser({
        password: 'hashed-password',
      });

      const authData = {
        accessToken: 'jwt-token',
        user: mockUser,
      };

      // Act
      const result = new AuthResponseDto(authData);

      // Assert
      expect(result.user).not.toHaveProperty('password');
      expect((result.user as any).password).toBeUndefined();
    });
  });
});
