/**
 * @file Application Enums
 * @description Centralized enum definitions for application-wide constants
 * 
 * This file defines:
 * - OrderStatus: Order lifecycle states
 * - BillStatus: Bill payment states
 * 
 * @module config/enums
 * @see {@link ../services} for usage in business logic
 * @see {@link ../controllers} for usage in API endpoints
 */

/**
 * Order Status Enum
 * 
 * Represents the lifecycle of an order from creation to completion.
 * 
 * States:
 * - PENDING: Order created, waiting for kitchen
 * - COOKING: Kitchen is preparing the order
 * - READY: Order is ready for serving
 * - SERVED: Order has been served to customer
 * - COMPLETED: Order finished (used for billing)
 * - CANCELLED: Order was cancelled
 * 
 * @example
 * const order = { status: OrderStatus.PENDING };
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  READY = 'READY',
  SERVED = 'SERVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * Bill Status Enum
 * 
 * Represents the payment status of a table's bill.
 * 
 * States:
 * - OPEN: Bill is active, customer hasn't paid yet
 * - PAID: Bill has been paid and closed
 * - CANCELLED: Bill was cancelled (table closed without payment)
 * 
 * @example
 * const bill = { status: BillStatus.OPEN };
 */
export enum BillStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}