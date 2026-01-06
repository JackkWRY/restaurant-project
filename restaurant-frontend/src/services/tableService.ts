import { ApiService } from './api';
import type { Table } from '@/types';

/**
 * Table Service
 * 
 * Handles all table-related API operations including:
 * - Fetching table status and details
 * - Creating, updating, and deleting tables
 * - Toggling table availability
 * - Closing tables (checkout)
 * - Staff call functionality
 */
class TableService extends ApiService {
  /**
   * Get status of all tables
   */
  async getTableStatus() {
    return this.get<Table[]>('/api/tables/status');
  }

  /**
   * Get detailed information for a specific table
   */
  async getTableDetails(id: number) {
    return this.get(`/api/tables/${id}/details`);
  }

  /**
   * Get single table by ID
   */
  async getTableById(id: number) {
    return this.get<Table>(`/api/tables/${id}`);
  }

  /**
   * Create new table
   */
  async createTable(name: string) {
    return this.post<Table>('/api/tables', { name });
  }

  /**
   * Update table name
   */
  async updateTable(id: number, name: string) {
    return this.put<Table>(`/api/tables/${id}`, { name });
  }

  /**
   * Delete table
   */
  async deleteTable(id: number) {
    return this.delete(`/api/tables/${id}`);
  }

  /**
   * Toggle table availability
   */
  async toggleAvailability(id: number, isAvailable: boolean) {
    return this.patch(`/api/tables/${id}/availability`, { isAvailable });
  }

  /**
   * Close table and process payment
   */
  async closeTable(id: number) {
    return this.post(`/api/tables/${id}/close`, {});
  }

  /**
   * Update staff call status
   */
  async callStaff(id: number, isCalling: boolean) {
    return this.patch(`/api/tables/${id}/call`, { isCalling });
  }
}

export const tableService = new TableService();
