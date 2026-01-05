/**
 * @file Setting Controller
 * @description HTTP request handlers for application settings
 * 
 * This controller handles:
 * - Restaurant name retrieval and updates
 * - Application configuration management
 * 
 * @module controllers/settingController
 * @requires prisma
 * @requires schemas/settingSchema
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { updateSettingSchema } from '../schemas/settingSchema.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

type UpdateSettingInput = z.infer<typeof updateSettingSchema>;

/**
 * Retrieves the restaurant name setting
 * 
 * @param req - Express request
 * @param res - Express response
 * @returns 200 with restaurant name or default value
 * @throws {Error} If database query fails
 * 
 * @example
 * GET /api/settings/restaurant-name
 */
export const getRestaurantName = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'restaurant_name' }
    });
    
    sendSuccess(res, setting ? setting.value : 'Restaurant 🍳');
  } catch (error) {
    sendError(res, 'Failed to fetch settings');
  }
};

/**
 * Updates the restaurant name setting
 * 
 * Creates or updates the restaurant_name setting using upsert.
 * 
 * @param req - Express request with name in body
 * @param res - Express response
 * @returns 200 with updated setting
 */
export const updateRestaurantName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as UpdateSettingInput;
    
    const setting = await prisma.setting.upsert({
      where: { key: 'restaurant_name' },
      update: { value: name },
      create: { key: 'restaurant_name', value: name }
    });

    sendSuccess(res, setting);
  } catch (error) {
    sendError(res, 'Failed to update settings');
  }
};