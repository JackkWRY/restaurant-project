/**
 * @file Enum Definitions
 * @description Central enum definitions for the application
 * 
 * This module provides:
 * - ORDER_STATUS enum for order item states
 * - BILL_STATUS enum for bill states
 * - ROLE enum for user roles
 * 
 * @module config/enums
 * 
 * @see {@link constants} for configuration constants
 */

export enum ORDER_STATUS {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  READY = 'READY',
  SERVED = 'SERVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum BILL_STATUS {
  OPEN = 'OPEN',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum ROLE {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  KITCHEN = 'KITCHEN'
}