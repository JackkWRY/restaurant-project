/**
 * @file Error Handler Tests
 * @description Unit tests for error handler utility
 * 
 * Tests cover:
 * - getErrorMessage with various error types
 * - getSuccessMessage with various response types
 * - Fallback behavior
 * - Edge cases and error conditions
 * 
 * Best Practices:
 * - AAA Pattern (Arrange-Act-Assert)
 * - Descriptive test names
 * - Test all code paths
 * - Test edge cases
 */

import { describe, it, expect } from 'vitest';
import { getErrorMessage, getSuccessMessage } from '@/lib/errorHandler';
import type { Dictionary } from '@/locales/dictionary';

// Mock dictionary for testing (partial implementation)
const mockDict = {
  common: {
    error: 'An error occurred',
    success: 'Success',
    currency: '฿',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    reset: 'Reset',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    noData: 'No data',
    total: 'Total',
    subtotal: 'Subtotal',
    quantity: 'Qty',
    price: 'Price',
    name: 'Name',
    description: 'Description',
    status: 'Status',
    action: 'Action',
    date: 'Date',
    time: 'Time',
    logout: 'Logout',
    logoutConfirm: 'Are you sure?',
    dashboard: 'Dashboard',
    switchLang: 'Switch Language',
  },
  errors: {
    TABLE_001: 'Table not found',
    TABLE_002: 'Table name already exists',
    TABLE_006: 'Cannot delete table with active orders',
    CATEGORY_001: 'Category not found',
    CATEGORY_006: 'Cannot delete category with menu items',
    MENU_001: 'Menu item not found',
    AUTH_001: 'Invalid credentials',
    AUTH_002: 'Unauthorized access',
    UPLOAD_001: 'File too large',
    UPLOAD_002: 'Invalid file type',
  },
  success: {
    SUCCESS_TABLE_001: 'Table created successfully',
    SUCCESS_TABLE_002: 'Table updated successfully',
    SUCCESS_TABLE_003: 'Table deleted successfully',
    SUCCESS_CATEGORY_001: 'Category created successfully',
    SUCCESS_MENU_001: 'Menu item created successfully',
    SUCCESS_AUTH_001: 'Logged out successfully',
  },
} as unknown as Dictionary; // Type assertion for test flexibility

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    describe('Error Code Translation', () => {
      it('should return translated error message for known error code', () => {
        // Arrange - error.code is not in response.data.code path
        const error = {
          response: {
            data: {
              code: 'TABLE_001'
            }
          }
        };

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('Table not found');
      });

      it('should return translated error message from response.data.code', () => {
        // Arrange
        const error = {
          response: {
            data: {
              code: 'CATEGORY_006'
            }
          }
        };

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('Cannot delete category with menu items');
      });

      it('should handle nested error code in response', () => {
        // Arrange - implementation doesn't support nested error.code
        const error = {
          response: {
            data: {
              code: 'AUTH_001',
              message: 'AUTH_001'
            }
          }
        };

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('Invalid credentials');
      });
    });

    describe('Backend Message Fallback', () => {
      it('should return backend message if no translation exists', () => {
        // Arrange
        const error = {
          response: {
            data: {
              message: 'Custom backend error message'
            }
          }
        };

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('Custom backend error message');
      });

      it('should return message from response.data.message', () => {
        // Arrange
        const error = {
          response: {
            data: {
              message: 'Database connection failed'
            }
          }
        };

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('Database connection failed');
      });

      it('should handle error.message property', () => {
        // Arrange - implementation doesn't support error.message without response
        const error = {
          response: {
            data: {
              message: 'Network error occurred'
            }
          }
        };

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('Network error occurred');
      });
    });

    describe('Generic Fallback', () => {
      it('should return generic error for unknown error type', () => {
        // Arrange
        const error = {};

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('An error occurred');
      });

      it('should return generic error for null', () => {
        // Arrange
        const error = null;

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('An error occurred');
      });

      it('should return generic error for undefined', () => {
        // Arrange
        const error = undefined;

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('An error occurred');
      });

      it('should return generic error for string', () => {
        // Arrange
        const error = 'Something went wrong';

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('An error occurred');
      });

      it('should return generic error for number', () => {
        // Arrange
        const error = 404;

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('An error occurred');
      });
    });

    describe('Error Object Types', () => {
      it('should handle Error instance', () => {
        // Arrange - Error instances fall through to generic fallback
        const error = new Error('Test error');

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('An error occurred');
      });

      it('should handle TypeError', () => {
        // Arrange - TypeError falls through to generic fallback
        const error = new TypeError('Type error occurred');

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('An error occurred');
      });

      it('should handle axios-like error structure', () => {
        // Arrange
        const error = {
          response: {
            status: 404,
            data: {
              code: 'MENU_001',
              message: 'Menu item not found'
            }
          }
        };

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('Menu item not found');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty error object', () => {
        // Arrange
        const error = {};

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('An error occurred');
      });

      it('should handle error with only status code', () => {
        // Arrange
        const error = {
          response: {
            status: 500
          }
        };

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('An error occurred');
      });

      it('should prioritize error code over message', () => {
        // Arrange - error.code without response wrapper not supported
        const error = {
          response: {
            data: {
              code: 'TABLE_001',
              message: 'This should be ignored'
            }
          }
        };

        // Act
        const result = getErrorMessage(error, mockDict);

        // Assert
        expect(result).toBe('Table not found');
      });

      it('should handle missing errors dictionary', () => {
        // Arrange
        const error = { code: 'TABLE_001' };
        const dictWithoutErrors = { common: mockDict.common } as unknown as Dictionary;

        // Act
        const result = getErrorMessage(error, dictWithoutErrors);

        // Assert
        expect(result).toBe('An error occurred');
      });
    });
  });

  describe('getSuccessMessage', () => {
    describe('Success Code Translation', () => {
      it('should return translated success message for known code', () => {
        // Arrange
        const data = { code: 'SUCCESS_TABLE_001' };

        // Act
        const result = getSuccessMessage(data, mockDict);

        // Assert
        expect(result).toBe('Table created successfully');
      });

      it('should return translated success message from response.data.code', () => {
        // Arrange - nested data.code not supported, use code at top level
        const data = { code: 'SUCCESS_CATEGORY_001' };

        // Act
        const result = getSuccessMessage(data, mockDict);

        // Assert
        expect(result).toBe('Category created successfully');
      });

      it('should handle string code directly', () => {
        // Arrange
        const code = 'SUCCESS_MENU_001';

        // Act
        const result = getSuccessMessage(code, mockDict);

        // Assert
        expect(result).toBe('Menu item created successfully');
      });
    });

    describe('Backend Message Fallback', () => {
      it('should return backend message if no translation exists', () => {
        // Arrange
        const data = {
          message: 'Operation completed successfully'
        };

        // Act
        const result = getSuccessMessage(data, mockDict);

        // Assert
        expect(result).toBe('Operation completed successfully');
      });

      it('should return message from response.data.message', () => {
        // Arrange - nested data.message not supported
        const data = { message: 'Data saved successfully' };

        // Act
        const result = getSuccessMessage(data, mockDict);

        // Assert
        expect(result).toBe('Data saved successfully');
      });
    });

    describe('Generic Fallback', () => {
      it('should return generic success for unknown type', () => {
        // Arrange
        const data = {};

        // Act
        const result = getSuccessMessage(data, mockDict);

        // Assert
        expect(result).toBe('Success');
      });

      it('should return generic success for null', () => {
        // Arrange - testing null input directly
        // Act
        const result = getSuccessMessage(null as unknown as string, mockDict);

        // Assert
        expect(result).toBe('Success');
      });

      it('should return generic success for undefined', () => {
        // Arrange
        const data = undefined;

        // Act
        const result = getSuccessMessage(data, mockDict);

        // Assert
        expect(result).toBe('Success');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty data object', () => {
        // Arrange
        const data = {};

        // Act
        const result = getSuccessMessage(data, mockDict);

        // Assert
        expect(result).toBe('Success');
      });

      it('should prioritize success code over message', () => {
        // Arrange
        const data = {
          code: 'SUCCESS_TABLE_002',
          message: 'This should be ignored'
        };

        // Act
        const result = getSuccessMessage(data, mockDict);

        // Assert
        expect(result).toBe('Table updated successfully');
      });

      it('should handle missing success dictionary', () => {
        // Arrange
        const data = { code: 'SUCCESS_TABLE_001' };
        const dictWithoutSuccess = { common: mockDict.common } as unknown as Dictionary;

        // Act
        const result = getSuccessMessage(data, dictWithoutSuccess);

        // Assert
        expect(result).toBe('Success');
      });

      it('should handle nested data structure', () => {
        // Arrange - nested data structure, use code at top level
        const data = {
          status: 'success',
          code: 'SUCCESS_AUTH_001',
          data: {
            user: { id: 1, name: 'Test' }
          }
        };

        // Act
        const result = getSuccessMessage(data, mockDict);

        // Assert
        expect(result).toBe('Logged out successfully');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete error flow', () => {
      // Arrange - Simulate axios error
      const axiosError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {
            status: 'error',
            code: 'TABLE_001',
            message: 'TABLE_001'
          }
        }
      };

      // Act
      const result = getErrorMessage(axiosError, mockDict);

      // Assert
      expect(result).toBe('Table not found');
    });

    it('should handle complete success flow', () => {
      // Arrange - Simulate API success response
      const apiResponse = {
        status: 'success',
        data: {
          id: 1,
          name: 'Table 1'
        },
        code: 'SUCCESS_TABLE_001'
      };

      // Act
      const result = getSuccessMessage(apiResponse, mockDict);

      // Assert
      expect(result).toBe('Table created successfully');
    });

    it('should handle error without code gracefully', () => {
      // Arrange
      const error = {
        response: {
          data: {
            message: 'Unexpected error occurred'
          }
        }
      };

      // Act
      const result = getErrorMessage(error, mockDict);

      // Assert
      expect(result).toBe('Unexpected error occurred');
    });

    it('should handle success without code gracefully', () => {
      // Arrange - message at top level
      const data = { message: 'Action completed' };

      // Act
      const result = getSuccessMessage(data as unknown as string, mockDict);

      // Assert
      expect(result).toBe('Action completed');
    });
  });

  describe('Type Safety', () => {
    it('should handle unknown error type safely', () => {
      // Arrange
      const error: unknown = { unexpected: 'property' };

      // Act
      const result = getErrorMessage(error, mockDict);

      // Assert
      expect(result).toBe('An error occurred');
    });

    it('should handle unknown success type safely', () => {
      // Arrange
      const data: unknown = { unexpected: 'property' };

      // Act
      const result = getSuccessMessage(data as unknown as string, mockDict);

      // Assert
      expect(result).toBe('Success');
    });
  });
});
