import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { updateSettingSchema } from '../schemas/settingSchema.js';

type UpdateSettingInput = z.infer<typeof updateSettingSchema>;

export const getRestaurantName = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'restaurant_name' }
    });
    
    res.json({ 
      status: 'success', 
      data: setting ? setting.value : 'Restaurant 🍳'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateRestaurantName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as UpdateSettingInput;
    
    const setting = await prisma.setting.upsert({
      where: { key: 'restaurant_name' },
      update: { value: name },
      create: { key: 'restaurant_name', value: name }
    });

    res.json({ status: 'success', data: setting });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};