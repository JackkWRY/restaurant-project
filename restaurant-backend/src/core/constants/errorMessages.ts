/**
 * @file Centralized Error Messages
 * @description Standardized error messages for consistent error handling
 * 
 * This module provides:
 * - Consistent error messages across the application
 * - Type-safe error message constants
 * - Easy to maintain and update
 * - Supports i18n in the future
 * 
 * Benefits:
 * - Single source of truth for error messages
 * - Prevents typos and inconsistencies
 * - Easier to translate
 * - Better user experience
 * 
 * @module constants/errorMessages
 */

/**
 * Centralized error messages
 * 
 * Organized by error type for easy navigation.
 * Use these constants instead of hardcoded strings.
 * 
 * @example
 * // Bad
 * throw new NotFoundError('Table not found');
 * 
 * // Good
 * throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.TABLE);
 */
export const ERROR_MESSAGES = {
  /**
   * Not Found errors (404)
   */
  NOT_FOUND: {
    TABLE: 'Table not found',
    MENU: 'Menu not found',
    MENUS: (ids: number[]) => `Menus not found: ${ids.join(', ')}`,
    ORDER: 'Order not found',
    ORDER_ITEM: 'Order item not found',
    BILL: 'Bill not found',
    ACTIVE_BILL: 'Active bill not found',
    CATEGORY: 'Category not found',
    USER: 'User not found',
  },

  /**
   * Validation errors (400)
   */
  VALIDATION: {
    TABLE_NOT_AVAILABLE: 'Table is not available',
    TABLE_OCCUPIED: 'Table is already occupied',
    INVALID_QUANTITY: 'Quantity must be greater than 0',
    INVALID_PRICE: 'Price must be greater than 0',
    INVALID_STATUS: 'Invalid status value',
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_TRANSITION: (from: string, to: string) => 
      `Cannot transition from ${from} to ${to}`,
  },

  /**
   * Authentication errors (401)
   */
  AUTHENTICATION: {
    INVALID_CREDENTIALS: 'Invalid username or password',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    UNAUTHORIZED: 'Unauthorized access',
    NO_TOKEN: 'No token provided',
  },

  /**
   * Authorization errors (403)
   */
  AUTHORIZATION: {
    FORBIDDEN: 'Insufficient permissions',
    ADMIN_ONLY: 'Admin access required',
    STAFF_ONLY: 'Staff access required',
  },

  /**
   * Conflict errors (409)
   */
  CONFLICT: {
    DUPLICATE_USERNAME: 'Username already exists',
    DUPLICATE_TABLE: 'Table name already exists',
    DUPLICATE_CATEGORY: 'Category name already exists',
    DUPLICATE_MENU: 'Menu name already exists',
  },

  /**
   * Business logic errors
   */
  BUSINESS: {
    CANNOT_CANCEL_COMPLETED: 'Cannot cancel completed order',
    CANNOT_MODIFY_CLOSED_BILL: 'Cannot modify closed bill',
    NO_ITEMS_IN_ORDER: 'Order must have at least one item',
    BILL_ALREADY_PAID: 'Bill has already been paid',
  },
} as const;
