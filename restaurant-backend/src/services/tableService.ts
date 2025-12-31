import { tableRepository } from '../repositories/tableRepository.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { TableDto } from '../dtos/tableDto.js';

interface CreateTableInput {
  name: string;
  qrCode?: string;
}

interface UpdateTableInput {
  name?: string;
  qrCode?: string;
  isAvailable?: boolean;
}

/**
 * Table Service
 * Handles all business logic related to tables
 */
export class TableService {
  /**
   * Get all tables
   */
  async getTables() {
    const tables = await tableRepository.findAll();
    return TableDto.fromPrismaMany(tables);
  }

  /**
   * Get table by ID
   */
  async getTableById(id: number) {
    const table = await tableRepository.findById(id);

    if (!table) {
      throw new NotFoundError('Table');
    }

    return TableDto.fromPrisma(table);
  }

  /**
   * Create table
   */
  async createTable(data: CreateTableInput) {
    // Check if table name already exists
    const existing = await tableRepository.findByName(data.name);

    if (existing) {
      throw new ConflictError('Table name already exists');
    }

    const table = await tableRepository.create({
      name: data.name,
      qrCode: data.qrCode || ''
    });

    return TableDto.fromPrisma(table);
  }

  /**
   * Update table
   */
  async updateTable(id: number, data: UpdateTableInput) {
    // Check table exists
    await this.getTableById(id);

    // If name is being updated, check for duplicates
    if (data.name) {
      const existing = await tableRepository.findByName(data.name);

      if (existing && existing.id !== id) {
        throw new ConflictError('Table name already exists');
      }
    }

    const table = await tableRepository.update(id, data);

    return TableDto.fromPrisma(table);
  }

  /**
   * Delete table
   */
  async deleteTable(id: number) {
    // Check table exists
    const table = await this.getTableById(id);

    // Check if table is occupied
    if (table.isOccupied) {
      throw new ConflictError('Cannot delete occupied table');
    }

    await tableRepository.delete(id);

    return { message: 'Table deleted successfully' };
  }

  /**
   * Toggle table availability
   */
  async toggleAvailability(id: number) {
    const table = await this.getTableById(id);

    const updated = await tableRepository.update(id, {
      isAvailable: !table.isAvailable
    });

    return TableDto.fromPrisma(updated);
  }

  /**
   * Update call staff status
   */
  async updateCallStaffStatus(id: number, isCallingStaff: boolean) {
    await this.getTableById(id);

    const updated = await tableRepository.updateCallStaffStatus(id, isCallingStaff);

    return TableDto.fromPrisma(updated);
  }
}

// Export singleton instance
export const tableService = new TableService();
