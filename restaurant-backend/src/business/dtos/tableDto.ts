/**
 * @file Table Data Transfer Objects
 * @description DTOs for table-related API responses
 * 
 * This file provides:
 * - TableDto: Table information for API responses
 * - Transformation from Prisma models
 * - Simple, flat structure (no nested relations)
 * 
 * Property descriptions:
 * - id: Unique table identifier
 * - name: Table name/number (e.g., "A1", "B2")
 * - qrCode: QR code URL for customer access
 * - isOccupied: Whether table has active orders
 * - isAvailable: Whether table is available for seating
 * - isCallingStaff: Whether customer pressed call staff button
 * 
 * @module dtos/tableDto
 * @requires @prisma/client
 * 
 * @see {@link ../controllers/tableController.ts} for usage
 * @see {@link ../services/tableService.ts} for business logic
 */

import type { Table } from '@prisma/client';

/**
 * Table DTO (Data Transfer Object)
 * 
 * Controls what table data is exposed through the API.
 * Simple structure with no nested relations.
 * 
 * @example
 * const tableDto = TableDto.fromPrisma(table);
 * res.json({ status: 'success', data: tableDto });
 */
export class TableDto {
  id: number;
  name: string;
  qrCode: string | null;
  isOccupied: boolean;
  isAvailable: boolean;
  isCallingStaff: boolean;

  constructor(table: Table) {
    this.id = table.id;
    this.name = table.name;
    this.qrCode = table.qrCode;
    this.isOccupied = table.isOccupied;
    this.isAvailable = table.isAvailable;
    this.isCallingStaff = table.isCallingStaff;
  }

  /**
   * Convert single Prisma Table to DTO
   */
  static fromPrisma(table: Table): TableDto {
    return new TableDto(table);
  }

  /**
   * Convert array of Prisma Tables to DTOs
   */
  static fromPrismaMany(tables: Table[]): TableDto[] {
    return tables.map(table => new TableDto(table));
  }
}
