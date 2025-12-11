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

// 3. สร้างเมนูใหม่
export const createMenu = async (req: Request, res: Response) => {
  try {
    const { nameTH, nameEN, price, categoryId, imageUrl } = req.body;
    
    const newMenu = await prisma.menu.create({
      data: {
        nameTH,
        nameEN,
        price: Number(price),
        categoryId: Number(categoryId),
        imageUrl: imageUrl || '', // ถ้าไม่ใส่รูป ให้เป็นว่างๆ
        isAvailable: true
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
    const { nameTH, nameEN, price, categoryId, imageUrl, isAvailable } = req.body;

    const updatedMenu = await prisma.menu.update({
      where: { id: Number(id) },
      data: {
        nameTH,
        nameEN,
        price: Number(price),
        categoryId: Number(categoryId),
        imageUrl,
        isAvailable
      }
    });

    res.json({ status: 'success', data: updatedMenu });
  } catch (error) {
    console.error("Update Menu Error:", error);
    res.status(500).json({ error: 'Failed to update menu' });
  }
};

// 5. ลบเมนู
export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // ลบข้อมูล (Soft delete หรือ Hard delete ก็ได้ แต่ Prisma ลบเลยคือ Hard delete)
    await prisma.menu.delete({
      where: { id: Number(id) }
    });

    res.json({ status: 'success', message: 'Menu deleted' });
  } catch (error) {
    console.error("Delete Menu Error:", error);
    res.status(500).json({ error: 'Failed to delete menu' });
  }
};