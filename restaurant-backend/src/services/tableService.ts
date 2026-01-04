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
   * Retrieves all tables with their current status
   * 
   * @returns Array of tables with DTO transformation
   */
  async getTables() {
    const tables = await tableRepository.findAll();
    return TableDto.fromPrismaMany(tables);
  }

  /**
   * Retrieves a single table by ID
   * 
   * @param id - Table ID
   * @returns Table data with DTO transformation
   * @throws {NotFoundError} If table doesn't exist
   */
  async getTableById(id: number) {
    const table = await tableRepository.findById(id);

    if (!table) {
      throw new NotFoundError('Table');
    }

    return TableDto.fromPrisma(table);
  }

  /**
   * Creates a new table with validation
   * 
   * Validates that table name is unique before creation.
   * 
   * @param data - Table creation data
   * @returns Created table with DTO transformation
   * @throws {ConflictError} If table name already exists
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
   * Updates an existing table with validation
   * 
   * Validates table exists and name uniqueness if name is being updated.
   * 
   * @param id - Table ID
   * @param data - Update data
   * @returns Updated table with DTO transformation
   * @throws {NotFoundError} If table doesn't exist
   * @throws {ConflictError} If new name already exists
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
   * Deletes a table with safety checks
   * 
   * Validates table is not occupied before deletion.
   * 
   * @param id - Table ID
   * @returns Success message
   * @throws {NotFoundError} If table doesn't exist
   * @throws {ConflictError} If table is occupied
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
   * Toggles table availability status
   * 
   * @param id - Table ID
   * @returns Updated table with DTO transformation
   * @throws {NotFoundError} If table doesn't exist
   */
  async toggleAvailability(id: number) {
    const table = await this.getTableById(id);

    const updated = await tableRepository.update(id, {
      isAvailable: !table.isAvailable
    });

    return TableDto.fromPrisma(updated);
  }

  /**
   * Updates call staff status for a table
   * 
   * @param id - Table ID
   * @param isCallingStaff - New call staff status
   * @returns Updated table with DTO transformation
   * @throws {NotFoundError} If table doesn't exist
   */
  async updateCallStaffStatus(id: number, isCallingStaff: boolean) {
    await this.getTableById(id);

    const updated = await tableRepository.updateCallStaffStatus(id, isCallingStaff);

    return TableDto.fromPrisma(updated);
  }
}

// Export singleton instance
export const tableService = new TableService();
