/**
 * @file Category Controller
 * @description HTTP request handlers for category management endpoints
 * 
 * This controller handles:
 * - Category CRUD operations
 * - Category retrieval with menu counts
 * - Category validation
 * 
 * @module controllers/categoryController
 * @requires prisma
 * @requires schemas/categorySchema
 * 
 * @see {@link ../services/categoryService.ts} for alternative service-based approach
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import logger from '../config/logger.js';
import { createCategorySchema } from '../schemas/categorySchema.js';
import { sendSuccess, sendCreated, sendError, sendBadRequest } from '../utils/apiResponse.js';

type CategoryInput = z.infer<typeof createCategorySchema>;

/**
 * Retrieves all categories with menu count
 * 
 * Includes count of non-deleted menus in each category.
 * 
 * @param req - Express request
 * @param res - Express response
 * @returns 200 with array of categories
 * @throws {Error} If database query fails
 * 
 * @example
 * GET /api/categories
 */
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

/**
 * Creates a new category
 * 
 * @param req - Express request with category name in body
 * @param res - Express response
 * @returns 201 with created category
 */
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

/**
 * Updates an existing category
 * 
 * @param req - Express request with category ID in params and name in body
 * @param res - Express response
 * @returns 200 with updated category
 */
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

/**
 * Deletes a category if it has no associated menus
 * 
 * Validates that no menus exist in this category before deletion
 * to maintain referential integrity.
 * 
 * @param req - Express request with category ID in params
 * @param res - Express response
 * @returns 200 on success, 400 if category has menus
 */
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