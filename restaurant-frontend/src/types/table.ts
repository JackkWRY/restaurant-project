/**
 * @file Table Type Definitions
 * @description Type definitions for table entities
 * 
 * This module provides:
 * - Table interface for table data
 * - TableInfo interface for table information
 * 
 * @module types/table
 * 
 * @see {@link components/staff/StaffDashboard} for usage
 */

// Table-related types

export interface Table {
  id: number;
  name: string;
  isAvailable: boolean;
  isCallingStaff?: boolean;
  currentOrder?: {
    id: number;
    totalAmount: number;
    itemCount: number;
  };
}

export interface TableInfo {
  id: number;
  name: string;
  isAvailable: boolean;
  isCallingStaff: boolean;
}
