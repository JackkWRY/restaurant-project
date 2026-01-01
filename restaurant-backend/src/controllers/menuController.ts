import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { menuService } from '../services/menuService.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

/**
 * Menu Controller
 * Handles HTTP requests and delegates business logic to MenuService
 */

/**
 * GET /api/menus
 * Get all menus with optional filtering
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
 * GET /api/menus/:id
 * Get menu by ID
 */
export const getMenuById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const menu = await menuService.getMenuById(id);
  
  sendSuccess(res, menu);
});

/**
 * POST /api/menus
 * Create new menu
 */
export const createMenu = asyncHandler(async (req: Request, res: Response) => {
  const menu = await menuService.createMenu(req.body);
  
  sendCreated(res, menu);
});

/**
 * PUT /api/menus/:id
 * Update menu
 */
export const updateMenu = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const menu = await menuService.updateMenu(id, req.body);
  
  sendSuccess(res, menu);
});

/**
 * DELETE /api/menus/:id
 * Soft delete menu
 */
export const deleteMenu = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await menuService.deleteMenu(id);
  
  sendSuccess(res, undefined, 'Menu deleted');
});

/**
 * PATCH /api/menus/:id/toggle-availability
 * Toggle menu availability
 */
export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const menu = await menuService.toggleAvailability(id);
  
  sendSuccess(res, menu);
});

/**
 * PATCH /api/menus/:id/toggle-visibility
 * Toggle menu visibility
 */
export const toggleVisibility = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const menu = await menuService.toggleVisibility(id);
  
  sendSuccess(res, menu);
});