import type { Request, Response } from 'express';
import prisma from '../prisma.js';

// 1. ดึงเมนูทั้งหมด (สำหรับหน้าลูกค้า)
export const getMenus = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        menus: {
          where: { isVisible: true }, 
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

// 2. ดึงเมนูทั้งหมด (สำหรับ Admin - เห็นทุกอย่าง)
export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const menus = await prisma.menu.findMany({
      include: { category: true },
      orderBy: { id: 'asc' }
    });
    res.json({ status: 'success', data: menus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// 3. สร้างเมนูใหม่
export const createMenu = async (req: Request, res: Response) => {
  try {
    const { nameTH, nameEN, price, categoryId, imageUrl, isRecommended, isAvailable, isVisible } = req.body;
    
    const newMenu = await prisma.menu.create({
      data: {
        nameTH,
        nameEN,
        price: Number(price),
        categoryId: Number(categoryId),
        imageUrl: imageUrl || '',
        isRecommended: Boolean(isRecommended),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true
      }
    });

    res.status(201).json({ status: 'success', data: newMenu });
  } catch (error) {
    console.error("Create Menu Error:", error);
    res.status(500).json({ error: 'Failed to create menu' });
  }
};

// 4. แก้ไขเมนู
export const updateMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { nameTH, nameEN, price, categoryId, imageUrl, isAvailable, isVisible, isRecommended } = req.body;

    const updatedMenu = await prisma.menu.update({
      where: { id: Number(id) },
      data: {
        nameTH,
        nameEN,
        price: Number(price),
        categoryId: Number(categoryId),
        imageUrl,
        isRecommended: isRecommended !== undefined ? Boolean(isRecommended) : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined
      }
    });

    res.json({ status: 'success', data: updatedMenu });
  } catch (error) {
    console.error("Update Menu Error:", error);
    res.status(500).json({ error: 'Failed to update menu' });
  }
};

// 5. ลบเมนู (เหมือนเดิม)
export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.menu.delete({
      where: { id: Number(id) }
    });
    res.json({ status: 'success', message: 'Menu deleted' });
  } catch (error) {
    console.error("Delete Menu Error:", error);
    res.status(500).json({ error: 'Failed to delete menu' });
  }
};