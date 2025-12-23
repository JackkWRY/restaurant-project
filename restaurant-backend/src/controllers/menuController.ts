import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { createMenuSchema, updateMenuSchema } from '../schemas/menuSchema.js';

type CreateMenuInput = z.infer<typeof createMenuSchema>;
type UpdateMenuInput = z.infer<typeof updateMenuSchema>;

export const getMenus = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        menus: {
          where: { 
            isVisible: true,
            deletedAt: null 
          }, 
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    res.json({ status: 'success', data: categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
};

export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const menus = await prisma.menu.findMany({
      where: { 
        deletedAt: null 
      }, 
      include: { category: true },
      orderBy: { id: 'asc' }
    });
    res.json({ status: 'success', data: menus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

export const createMenu = async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateMenuInput;
    
    const newMenu = await prisma.menu.create({
      data: {
        nameTH: body.nameTH,
        nameEN: body.nameEN || '',
        description: body.description,
        price: body.price,
        categoryId: body.categoryId,
        imageUrl: body.imageUrl || '',
        isRecommended: body.isRecommended || false,
        isAvailable: body.isAvailable ?? true,
        isVisible: body.isVisible ?? true
      }
    });

    res.status(201).json({ status: 'success', data: newMenu });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu' });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as UpdateMenuInput;

    const updatedMenu = await prisma.menu.update({
      where: { id: Number(id) },
      data: {
        nameTH: body.nameTH,
        nameEN: body.nameEN,
        description: body.description,
        price: body.price,
        categoryId: body.categoryId,
        imageUrl: body.imageUrl,
        isRecommended: body.isRecommended,
        isAvailable: body.isAvailable,
        isVisible: body.isVisible
      }
    });

    res.json({ status: 'success', data: updatedMenu });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu' });
  }
};

export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.menu.update({
      where: { id: Number(id) },
      data: { 
        deletedAt: new Date(),
        isVisible: false,
        isAvailable: false
      }
    });

    res.json({ status: 'success', message: 'Menu deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu' });
  }
};