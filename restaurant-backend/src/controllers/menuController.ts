import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { createMenuSchema, updateMenuSchema } from '../schemas/menuSchema.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

type CreateMenuInput = z.infer<typeof createMenuSchema>;
type UpdateMenuInput = z.infer<typeof updateMenuSchema>;

export const getMenus = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { scope } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    if (scope === 'all') {
      const where = { deletedAt: null };
      
      const [menus, total] = await Promise.all([
        prisma.menu.findMany({
          where,
          include: { category: true },
          orderBy: { id: 'desc' },
          skip,
          take: limit
        }),
        prisma.menu.count({ where })
      ]);

      res.json({ 
        status: 'success', 
        data: menus,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
      return;
    }

    // For customer view - no pagination, grouped by category
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
});

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