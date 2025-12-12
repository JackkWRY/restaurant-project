import type { Request, Response } from 'express';
import prisma from '../prisma.js';

// 1. ดึงชื่อร้าน (ถ้าไม่มีให้คืนค่า Default)
export const getRestaurantName = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'restaurant_name' }
    });
    
    res.json({ 
      status: 'success', 
      data: setting ? setting.value : 'ร้านอาหาร 🍳' // Default value
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// 2. บันทึกชื่อร้าน
export const updateRestaurantName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
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