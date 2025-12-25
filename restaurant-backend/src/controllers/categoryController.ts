import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import logger from '../config/logger.js';
import { createCategorySchema } from '../schemas/categorySchema.js';

type CategoryInput = z.infer<typeof createCategorySchema>;

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            menus: {
              where: {
                deletedAt: null
              }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });
    res.json({ status: 'success', data: categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as CategoryInput;

    const newCategory = await prisma.category.create({
      data: { name }
    });

    res.status(201).json({ status: 'success', data: newCategory });
  } catch (error) {
    logger.error('Create category error', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body as CategoryInput;

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name }
    });

    res.json({ status: 'success', data: updatedCategory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const menuCount = await prisma.menu.count({
      where: { categoryId: Number(id) }
    });

    if (menuCount > 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Cannot delete category with existing menus. Please move or delete menus first.' 
      });
      return; 
    }

    await prisma.category.delete({
      where: { id: Number(id) }
    });

    res.json({ status: 'success', message: 'Category deleted' });
  } catch (error) {
    logger.error('Delete category error', { error: error instanceof Error ? error.message : 'Unknown error', categoryId: id });
    res.status(500).json({ error: 'Failed to delete category' });
  }
};