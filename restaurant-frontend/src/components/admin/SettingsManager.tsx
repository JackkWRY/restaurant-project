/**
 * @file Settings Manager Component
 * @description Restaurant settings management (name configuration)
 * 
 * This component handles:
 * - Fetch current restaurant name
 * - Update restaurant name
 * - Form validation
 * - Loading states during save
 * 
 * State management:
 * - Local state for restaurant name input
 * - Local state for loading indicator
 * 
 * Features:
 * - Auto-fetch settings on mount
 * - Form submission with validation
 * - Success/error alerts
 * 
 * @module components/admin/SettingsManager
 * @requires react
 * @requires lucide-react
 * 
 * @see {@link AdminDashboard} for parent dashboard
 */

"use client";

import { settingsService } from "@/services/settingsService";
import { logger } from "@/lib/logger";
import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";
import type { Dictionary } from "@/locales/dictionary";
import { getErrorMessage, getSuccessMessage } from '@/lib/errorHandler';

/**
 * Props for SettingsManager component
 * 
 * @property {Dictionary} dict - Internationalization dictionary
 * 
 * @example
 * <SettingsManager dict={dictionary} />
 */
interface SettingsManagerProps {
  dict: Dictionary;
}

/**
 * Settings Manager Component
 * 
 * Manages restaurant settings including restaurant name.
 * Provides simple form interface for updating settings.
 * 
 * @param props - Component props
 * @returns JSX.Element
 * 
 * @example
 * <SettingsManager dict={dictionary} />
 */
export default function SettingsManager({ dict }: SettingsManagerProps) {
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getRestaurantName();
      if (data.status === "success" && data.data) {
        setRestaurantName(data.data);
      }
    } catch (error) {
      logger.error("Failed to fetch settings:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await settingsService.updateRestaurantName(restaurantName);

      if (data.status === 'success') {
        const message = getSuccessMessage(data, dict); toast.success(message);
      } else {
        const message = getErrorMessage(data, dict); toast.error(message);
      }
    } catch (error) {
      logger.error("Failed to save settings:", error);
      const message = getErrorMessage(error, dict); toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Settings className="text-purple-600" />
        {dict.admin.shopSettings}
      </h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            {dict.admin.name}
          </label>
          <input
            type="text"
            required
            className="w-full border p-3 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder={dict.admin.placeholderName}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 disabled:bg-slate-400"
        >
          {loading ? (
            dict.common.loading
          ) : (
            <>
              <Save size={20} /> {dict.admin.save}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
