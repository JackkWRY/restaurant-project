/**
 * @file Category Controller
 * @description HTTP request handlers for category management endpoints
 * 
 * This controller handles:
 * - Category CRUD operations
 * - Category retrieval with menu counts
 * - Category validation and referential integrity
 * 
 * Business rules:
 * - Cannot delete categories with existing menus
 * - Category names should be unique (enforced at service layer)
 * 
 * @module controllers/categoryController
 * @requires prisma
 * @requires schemas/categorySchema
 * @requires utils/apiResponse
 * 
 * @see {@link ../services/categoryService.ts} for alternative service-based approach
 * @see {@link ../schemas/categorySchema.ts} for validation schemas
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../database/client/prisma.js';
import logger from '../../core/config/logger.js';
import { createCategorySchema } from '../schemas/categorySchema.js';
import { sendSuccess, sendCreated, sendError, sendBadRequest } from '../../core/utils/apiResponse.js';

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
      where: {
        deletedAt: null  // Filter out soft-deleted categories
      },
      include: {
        // Include count of non-deleted menus for each category
        // This helps admins see which categories are in use
        _count: {
          select: {
            menus: {
              where: {
                deletedAt: null  // Exclude soft-deleted menus from count
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
 * @throws {Error} If category creation fails
 * 
 * @example
 * POST /api/categories
 * Body: { "name": "Appetizers" }
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
 * @throws {Error} If category doesn't exist or update fails
 * 
 * @example
 * PUT /api/categories/1
 * Body: { "name": "Main Dishes" }
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
 * Soft deletes a category
 * 
 * Uses soft delete pattern to preserve data and avoid foreign key issues.
 * Categories with soft-deleted menus can be deleted safely.
 * 
 * @param req - Express request with category ID in params
 * @param res - Express response
 * @returns 200 on success
 */
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Check if category has any active (non-deleted) menus
    const activeMenuCount = await prisma.menu.count({
      where: { 
        categoryId: Number(id),
        deletedAt: null  // Only count active menus
      }
    });

    if (activeMenuCount > 0) {
      sendBadRequest(res, 'Cannot delete category with active menus. Please delete or move menus first.');
      return; 
    }

    // Soft delete the category
    await prisma.category.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() }
    });

    sendSuccess(res, undefined, 'Category deleted');
  } catch (error) {
    logger.error('Delete category error', { error: error instanceof Error ? error.message : 'Unknown error', categoryId: id });
    sendError(res, 'Failed to delete category');
  }
};