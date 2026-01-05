/**
 * @file Menu Controller
 * @description HTTP request handlers for menu management endpoints
 * 
 * This controller delegates business logic to MenuService and handles:
 * - Menu retrieval with filtering and pagination
 * - Menu CRUD operations
 * - Menu availability and visibility toggles
 * 
 * @module controllers/menuController
 * @requires services/menuService
 * @requires middlewares/errorHandler
 * 
 * @see {@link ../services/menuService.ts} for business logic
 * @see {@link ../schemas/menuSchema.ts} for validation schemas
 */

import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { menuService } from '../services/menuService.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

/**
 * Retrieves all menus with optional filtering and pagination
 * 
 * Supports two response formats:
 * - Grouped by categories (default)
 * - Paginated list (when scope=all)
 * 
 * @param req - Express request with optional query params (scope, page, limit)
 * @param res - Express response
 * @returns 200 with menus grouped by categories or paginated list
 * @throws {Error} If database query fails
 * 
 * @example
 * // Get menus grouped by category
 * GET /api/menus
 * 
 * @example
 * // Get paginated menu list
 * GET /api/menus?scope=all&page=1&limit=10
 */
export const getMenus = asyncHandler(async (req: Request, res: Response) => {
  const { scope } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;

  const result = await menuService.getMenus({ scope: scope as string, page, limit });

  if ('pagination' in result) {
    // Pagination response - keep custom format for now
    res.json({
      status: 'success',
      data: result.menus,
      pagination: result.pagination
    });
  } else {
    sendSuccess(res, result.categories);
  }
});

/**
 * Retrieves a single menu item by ID
 * 
 * @param req - Express request with menu ID in params
 * @param res - Express response
 * @returns 200 with menu data or 404 if not found
 */
export const getMenuById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const menu = await menuService.getMenuById(id);
  
  sendSuccess(res, menu);
});

/**
 * Creates a new menu item
 * 
 * @param req - Express request with menu data in body
 * @param res - Express response
 * @returns 201 with created menu
 * @throws {NotFoundError} If category doesn't exist
 * @throws {ValidationError} If menu data is invalid
 * 
 * @example
 * POST /api/menus
 * Body: {
 *   "nameTH": "ข้าวผัด",
 *   "price": 50,
 *   "categoryId": 1,
 *   "imageUrl": "https://..."
 * }
 */
export const createMenu = asyncHandler(async (req: Request, res: Response) => {
  const menu = await menuService.createMenu(req.body);
  
  sendCreated(res, menu);
});

/**
 * Updates an existing menu item
 * 
 * @param req - Express request with menu ID in params and update data in body
 * @param res - Express response
 * @returns 200 with updated menu
 */
export const updateMenu = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const menu = await menuService.updateMenu(id, req.body);
  
  sendSuccess(res, menu);
});

/**
 * Soft deletes a menu item
 * 
 * Sets deletedAt timestamp instead of permanent deletion.
 * 
 * @param req - Express request with menu ID in params
 * @param res - Express response
 * @returns 200 with success message
 */
export const deleteMenu = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await menuService.deleteMenu(id);
  
  sendSuccess(res, undefined, 'Menu deleted');
});

/**
 * Toggles menu item availability status
 * 
 * Controls whether customers can order this item.
 * 
 * @param req - Express request with menu ID in params
 * @param res - Express response
 * @returns 200 with updated menu
 */
export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const menu = await menuService.toggleAvailability(id);
  
  sendSuccess(res, menu);
});

/**
 * Toggles menu item visibility status
 * 
 * Controls whether this item appears in the menu list.
 * 
 * @param req - Express request with menu ID in params
 * @param res - Express response
 * @returns 200 with updated menu
 */
export const toggleVisibility = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const menu = await menuService.toggleVisibility(id);
  
  sendSuccess(res, menu);
});