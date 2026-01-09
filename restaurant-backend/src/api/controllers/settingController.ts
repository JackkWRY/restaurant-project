/**
 * @file Setting Controller
 * @description HTTP request handlers for application settings management
 * 
 * This controller handles:
 * - Restaurant name retrieval and updates
 * - Application configuration management
 * - Settings persistence using key-value store
 * 
 * Settings are stored in the database using a key-value pattern
 * with upsert operations for atomic create-or-update behavior.
 * 
 * @module controllers/settingController
 * @requires prisma
 * @requires schemas/settingSchema
 * @requires utils/apiResponse
 * 
 * @see {@link ../schemas/settingSchema.ts} for validation schemas
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../database/client/prisma.js';
import { updateSettingSchema } from '../schemas/settingSchema.js';
import { sendSuccess, sendError } from '../../core/utils/apiResponse.js';
import { ErrorCodes, SuccessCodes } from '../../core/constants/errorCodes.js';

type UpdateSettingInput = z.infer<typeof updateSettingSchema>;

/**
 * Retrieves the restaurant name setting
 * 
 * Returns the configured restaurant name or a default value if not set.
 * 
 * @param req - Express request
 * @param res - Express response
 * @returns 200 with restaurant name string (default: 'Restaurant 🍳')
 * @throws {Error} If database query fails
 * 
 * @example
 * GET /api/settings/restaurant-name
 * 
 * @example
 * // Response
 * { "status": "success", "data": "My Restaurant" }
 */
export const getRestaurantName = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'restaurant_name' }
    });
    
    sendSuccess(res, setting ? setting.value : 'Restaurant 🍳');
  } catch (error) {
    sendError(res, ErrorCodes.SETTINGS_FETCH_FAILED);
  }
};

/**
 * Updates the restaurant name setting
 * 
 * Uses upsert operation to create the setting if it doesn't exist,
 * or update it if it already exists. This ensures atomic operation.
 * 
 * @param req - Express request with name in body
 * @param res - Express response
 * @returns 200 with updated setting record
 * @throws {Error} If database operation fails
 * 
 * @example
 * PUT /api/settings/restaurant-name
 * Body: { "name": "My Amazing Restaurant" }
 */
export const updateRestaurantName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as UpdateSettingInput;
    
    // Use upsert for atomic create-or-update operation
    // This prevents race conditions and simplifies logic
    const setting = await prisma.setting.upsert({
      where: { key: 'restaurant_name' },
      update: { value: name },  // If exists, update value
      create: { key: 'restaurant_name', value: name }  // If not exists, create new
    });

    sendSuccess(res, setting);
  } catch (error) {
    sendError(res, ErrorCodes.SETTINGS_UPDATE_FAILED);
  }
};