import type { Request, Response } from 'express';
import prisma from '../prisma.js';

// 1. ดึงหมวดหมู่ทั้งหมด
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { menus: true } // นับจำนวนเมนูในหมวดนี้มาให้ด้วย
        }
      }
    });
    res.json({ status: 'success', data: categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// 2. สร้างหมวดหมู่ใหม่
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return;

    const newCategory = await prisma.category.create({
      data: { name }
    });
    res.status(201).json({ status: 'success', data: newCategory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// 3. แก้ไขชื่อหมวดหมู่
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name }
    });
    res.json({ status: 'success', data: updatedCategory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// 4. ลบหมวดหมู่
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // เช็คก่อนว่ามีเมนูอาหารในหมวดนี้ไหม
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: { menus: true }
    });

    if (category && category.menus.length > 0) {
      res.status(400).json({ error: 'ไม่สามารถลบได้ เนื่องจากมีรายการอาหารอยู่ในหมวดหมู่นี้' });
      return; 
    }

    await prisma.category.delete({
      where: { id: Number(id) }
    });

    res.json({ status: 'success', message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};