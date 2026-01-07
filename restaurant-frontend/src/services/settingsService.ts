import { ApiService } from './api';

/**
 * Settings Service
 * 
 * Handles all settings-related API operations including:
 * - Fetching restaurant settings
 * - Updating restaurant settings
 */
class SettingsService extends ApiService {
  /**
   * Get restaurant name setting
   */
  async getRestaurantName() {
    return this.get<string>('/api/v1/settings/name');
  }

  /**
   * Update restaurant name setting
   * 
   * @param name - New restaurant name
   */
  async updateRestaurantName(name: string) {
    return this.post<{ message: string }>('/api/v1/settings/name', { name });
  }
}

export const settingsService = new SettingsService();
