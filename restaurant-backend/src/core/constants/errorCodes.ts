/**
 * @file Error Code Constants
 * @description Centralized error codes for API responses
 * 
 * Format: [DOMAIN]_[NUMBER]
 * - TABLE_xxx: Table-related errors
 * - CATEGORY_xxx: Category-related errors
 * - MENU_xxx: Menu-related errors
 * - AUTH_xxx: Authentication errors
 * - UPLOAD_xxx: Upload errors
 * - ANALYTICS_xxx: Analytics errors
 * - SETTINGS_xxx: Settings errors
 * - ERROR_xxx: Generic errors
 * 
 * Usage:
 * ```typescript
 * import { ErrorCodes } from '@/core/constants/errorCodes';
 * sendError(res, ErrorCodes.TABLE_NOT_FOUND);
 * ```
 * 
 * @module constants/errorCodes
 */

export const ErrorCodes = {
  // ========================================
  // Table Errors (TABLE_xxx)
  // ========================================
  TABLE_NOT_FOUND: 'TABLE_001',
  TABLE_CREATE_FAILED: 'TABLE_002',
  TABLE_UPDATE_FAILED: 'TABLE_003',
  TABLE_DELETE_FAILED: 'TABLE_004',
  TABLE_FETCH_FAILED: 'TABLE_005',
  TABLE_OCCUPIED: 'TABLE_006',
  TABLE_AVAILABLE: 'TABLE_007',
  TABLE_CLOSE_FAILED: 'TABLE_008',
  TABLE_UNSERVED_ITEMS: 'TABLE_009',
  TABLE_AVAILABILITY_UPDATE_FAILED: 'TABLE_010',
  TABLE_CALL_STAFF_UPDATE_FAILED: 'TABLE_011',
  TABLE_DETAILS_FETCH_FAILED: 'TABLE_012',

  // ========================================
  // Category Errors (CATEGORY_xxx)
  // ========================================
  CATEGORY_NOT_FOUND: 'CATEGORY_001',
  CATEGORY_CREATE_FAILED: 'CATEGORY_002',
  CATEGORY_UPDATE_FAILED: 'CATEGORY_003',
  CATEGORY_DELETE_FAILED: 'CATEGORY_004',
  CATEGORY_HAS_MENUS: 'CATEGORY_005',
  CATEGORY_FETCH_FAILED: 'CATEGORY_006',

  // ========================================
  // Menu Errors (MENU_xxx)
  // ========================================
  MENU_NOT_FOUND: 'MENU_001',
  MENU_CREATE_FAILED: 'MENU_002',
  MENU_UPDATE_FAILED: 'MENU_003',
  MENU_DELETE_FAILED: 'MENU_004',
  MENU_FETCH_FAILED: 'MENU_005',

  // ========================================
  // Auth Errors (AUTH_xxx)
  // ========================================
  AUTH_LOGIN_FAILED: 'AUTH_001',
  AUTH_LOGOUT_FAILED: 'AUTH_002',
  AUTH_TOKEN_REFRESH_FAILED: 'AUTH_003',
  AUTH_CONFIG_ERROR: 'AUTH_004',
  AUTH_INVALID_CREDENTIALS: 'AUTH_005',
  AUTH_UNAUTHORIZED: 'AUTH_006',

  // ========================================
  // Upload Errors (UPLOAD_xxx)
  // ========================================
  UPLOAD_NO_FILE: 'UPLOAD_001',
  UPLOAD_INVALID_FILE: 'UPLOAD_002',
  UPLOAD_FILE_TOO_LARGE: 'UPLOAD_003',
  UPLOAD_FAILED: 'UPLOAD_004',

  // ========================================
  // Analytics Errors (ANALYTICS_xxx)
  // ========================================
  ANALYTICS_FETCH_FAILED: 'ANALYTICS_001',
  ANALYTICS_BILLS_FETCH_FAILED: 'ANALYTICS_002',
  ANALYTICS_HISTORY_FETCH_FAILED: 'ANALYTICS_003',

  // ========================================
  // Settings Errors (SETTINGS_xxx)
  // ========================================
  SETTINGS_FETCH_FAILED: 'SETTINGS_001',
  SETTINGS_UPDATE_FAILED: 'SETTINGS_002',

  // ========================================
  // Order Errors (ORDER_xxx)
  // ========================================
  ORDER_CREATE_FAILED: 'ORDER_001',
  ORDER_UPDATE_FAILED: 'ORDER_002',
  ORDER_ITEM_UPDATE_FAILED: 'ORDER_003',
  ORDER_FETCH_FAILED: 'ORDER_004',

  // ========================================
  // Bill Errors (BILL_xxx)
  // ========================================
  BILL_FETCH_FAILED: 'BILL_001',
  BILL_CREATE_FAILED: 'BILL_002',

  // ========================================
  // Generic Errors (ERROR_xxx)
  // ========================================
  INTERNAL_ERROR: 'ERROR_001',
  VALIDATION_ERROR: 'ERROR_002',
  NOT_FOUND: 'ERROR_003',
  BAD_REQUEST: 'ERROR_004',
} as const;

/**
 * Success Message Codes
 */
export const SuccessCodes = {
  TABLE_DELETED: 'SUCCESS_TABLE_001',
  TABLE_CLOSED: 'SUCCESS_TABLE_002',
  TABLE_CREATED: 'SUCCESS_TABLE_003',
  TABLE_UPDATED: 'SUCCESS_TABLE_004',
  
  CATEGORY_DELETED: 'SUCCESS_CATEGORY_001',
  CATEGORY_CREATED: 'SUCCESS_CATEGORY_002',
  CATEGORY_UPDATED: 'SUCCESS_CATEGORY_003',
  
  MENU_DELETED: 'SUCCESS_MENU_001',
  MENU_CREATED: 'SUCCESS_MENU_002',
  MENU_UPDATED: 'SUCCESS_MENU_003',
  
  LOGOUT_SUCCESS: 'SUCCESS_AUTH_001',
  LOGIN_SUCCESS: 'SUCCESS_AUTH_002',
} as const;

// Type exports for type safety
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
export type SuccessCode = typeof SuccessCodes[keyof typeof SuccessCodes];
