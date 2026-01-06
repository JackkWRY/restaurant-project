/**
 * @file Custom React Hooks
 * @description Central export file for custom React hooks
 * 
 * This module provides:
 * - Staff dashboard hooks
 * - Future custom hooks
 * 
 * @module hooks
 * 
 * @example
 * ```typescript
 * import { useStaffSocket, useStaffData } from '@/hooks';
 * ```
 */

// Staff Dashboard Hooks
export { useStaffSocket } from './useStaffSocket';
export { useStaffData } from './useStaffData';
export type { TableStatus, OrderDetailItem } from './useStaffData';

// Menu Management Hooks
export { useMenuForm } from './useMenuForm';
export type { Menu } from './useMenuForm';

// Customer Hooks
export { useCustomerSocket } from './useCustomerSocket';

// Kitchen Hooks
export { useKitchenSocket } from './useKitchenSocket';
export { useKitchenData } from './useKitchenData';
export type { KitchenItem } from './useKitchenData';

// Placeholder for future custom hooks
// Example:
// export { useAuth } from './useAuth';
// export { useSocket } from './useSocket';
// export { useTableData } from './useTableData';
