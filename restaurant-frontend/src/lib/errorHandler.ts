/**
 * @file Error Handler Utility
 * @description Centralized error handling for API responses with i18n support
 * 
 * This utility provides:
 * - Type-safe error message extraction from API responses
 * - Automatic i18n translation based on error codes
 * - Fallback to generic error messages
 * - Success message handling
 * 
 * @module lib/errorHandler
 */

import type { Dictionary } from '@/locales/dictionary';

/**
 * API Error Response Type
 */
interface ApiErrorResponse {
  response?: {
    data?: {
      code?: string;
      message?: string;
    };
  };
}

/**
 * API Success Response Type
 */
interface ApiSuccessResponse {
  status?: string;
  code?: string;
  message?: string;
}

/**
 * Extracts and translates error message from API error
 * 
 * @param error - Error object from API call
 * @param dict - i18n dictionary
 * @returns Localized error message
 * 
 * @example
 * ```typescript
 * try {
 *   await tableService.deleteTable(id);
 * } catch (error) {
 *   const message = getErrorMessage(error, dict);
 *   toast.error(message);
 * }
 * ```
 */
export const getErrorMessage = (
  error: unknown,
  dict: Dictionary
): string => {
  // Type guard for API error response
  const isApiError = (err: unknown): err is ApiErrorResponse => {
    return (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      typeof (err as Record<string, unknown>).response === 'object' &&
      (err as Record<string, unknown>).response !== null
    );
  };

  if (isApiError(error)) {
    const errorCode = error.response?.data?.code;
    
    // Try to get localized message from dictionary
    if (errorCode && dict.errors && errorCode in dict.errors) {
      return dict.errors[errorCode as keyof typeof dict.errors];
    }
    
    // Fallback to backend message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
  }

  // Ultimate fallback
  return dict.common?.error || 'An error occurred';
};

/**
 * Extracts and translates success message from API response
 * 
 * @param response - API success response or code string
 * @param dict - i18n dictionary
 * @returns Localized success message
 * 
 * @example
 * ```typescript
 * const response = await tableService.deleteTable(id);
 * const message = getSuccessMessage(response, dict);
 * toast.success(message);
 * ```
 */
export const getSuccessMessage = (
  response: ApiSuccessResponse | string | undefined,
  dict: Dictionary
): string => {
  // Handle string code directly
  if (typeof response === 'string') {
    if (dict.success && response in dict.success) {
      return dict.success[response as keyof typeof dict.success];
    }
    return response;
  }

  // Handle response object
  if (response && typeof response === 'object') {
    const code = response.code || response.message;
    
    if (code && dict.success && code in dict.success) {
      return dict.success[code as keyof typeof dict.success];
    }
    
    if (response.message) {
      return response.message;
    }
  }

  // Fallback to generic success
  return dict.common?.success || 'Success';
};
