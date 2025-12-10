import type { Request, Response } from 'express';
import prisma from '../prisma.js'; // Import ตัวเชื่อม DB ที่เราเพิ่งสร้าง

// 1. ดึงเมนูทั้งหมด แยกตามหมวดหมู่ (เหมาะกับหน้าสั่งอาหารของลูกค้า)
export const getMenus = async (req: Request, res: Response) => {
  try {
    // ดึง Category ทั้งหมด และ "พ่วง" (include) รายการเมนูมาด้วย
    const categories = await prisma.category.findMany({
      include: {
        menus: {
          where: { isAvailable: true }, // เอาเฉพาะที่มีของ
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    res.json({ status: 'success', data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
};

// 2. ดึงเมนูทั้งหมด แบบรายการยาวๆ (เหมาะกับหน้าจัดการของ Staff/Admin)
export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const menus = await prisma.menu.findMany({
      include: { category: true }, // พ่วงชื่อหมวดหมู่มาด้วย
      orderBy: { id: 'asc' }
    });
    res.json({ status: 'success', data: menus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};