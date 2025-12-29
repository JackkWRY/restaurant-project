import type { Table } from '@prisma/client';

/**
 * Table DTO (Data Transfer Object)
 * Controls what table data is exposed through the API
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

  static fromPrisma(table: Table): TableDto {
    return new TableDto(table);
  }

  static fromPrismaMany(tables: Table[]): TableDto[] {
    return tables.map(table => new TableDto(table));
  }
}
