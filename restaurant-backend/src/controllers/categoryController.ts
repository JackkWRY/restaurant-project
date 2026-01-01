import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import logger from '../config/logger.js';
import { createCategorySchema } from '../schemas/categorySchema.js';
import { sendSuccess, sendCreated, sendError, sendBadRequest } from '../utils/apiResponse.js';

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
    sendSuccess(res, categories);
  } catch (error) {
    sendError(res, 'Failed to fetch categories');
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as CategoryInput;

    const newCategory = await prisma.category.create({
      data: { name }
    });

    sendCreated(res, newCategory);
  } catch (error) {
    logger.error('Create category error', { error: error instanceof Error ? error.message : 'Unknown error' });
    sendError(res, 'Failed to create category');
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

    sendSuccess(res, updatedCategory);
  } catch (error) {
    sendError(res, 'Failed to update category');
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const menuCount = await prisma.menu.count({
      where: { categoryId: Number(id) }
    });

    if (menuCount > 0) {
      sendBadRequest(res, 'Cannot delete category with existing menus. Please move or delete menus first.');
      return; 
    }

    await prisma.category.delete({
      where: { id: Number(id) }
    });

    sendSuccess(res, undefined, 'Category deleted');
  } catch (error) {
    logger.error('Delete category error', { error: error instanceof Error ? error.message : 'Unknown error', categoryId: id });
    sendError(res, 'Failed to delete category');
  }
};