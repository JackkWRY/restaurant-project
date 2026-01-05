/**
 * @file Menu Type Definitions
 * @description TypeScript interfaces for menu-related operations
 * 
 * This file provides:
 * - CreateMenuInput: Type for menu creation
 * - UpdateMenuInput: Type for menu updates (all fields optional)
 * - Type-safe service layer inputs
 * 
 * Property descriptions (CreateMenuInput):
 * - nameTH: Thai menu name (required)
 * - nameEN: English menu name (optional)
 * - description: Menu description (required)
 * - price: Menu price in THB (required)
 * - categoryId: Category ID (required)
 * - imageUrl: Menu image URL (optional)
 * - isRecommended: Recommended flag (optional, default: false)
 * - isAvailable: Availability flag (optional, default: true)
 * - isVisible: Visibility flag (optional, default: true)
 * 
 * Property descriptions (UpdateMenuInput):
 * - All fields optional for partial updates
 * 
 * Usage:
 * These types are used in service layer for type-safe operations.
 * Validation is handled by Zod schemas before reaching service layer.
 * 
 * @module types/menu
 * @see {@link ../services/menuService.ts} for usage
 * @see {@link ../schemas/menuSchema.ts} for validation
 */

/**
 * Menu Creation Input Type
 * 
 * Used when creating a new menu item.
 * All required fields must be provided.
 * 
 * @example
 * const menuInput: CreateMenuInput = {
 *   nameTH: "ข้าวผัด",
 *   nameEN: "Fried Rice",
 *   description: "Thai fried rice",
 *   price: 50,
 *   categoryId: 1,
 *   isAvailable: true
 * };
 */
export interface CreateMenuInput {
  nameTH: string;
  nameEN?: string;
  description: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  isRecommended?: boolean;
  isAvailable?: boolean;
  isVisible?: boolean;
}

/**
 * Menu Update Input Type
 * 
 * Used when updating an existing menu item.
 * All fields are optional for partial updates.
 * 
 * @example
 * const updates: UpdateMenuInput = {
 *   price: 60,
 *   isAvailable: false
 * };
 */
export interface UpdateMenuInput {
  nameTH?: string;
  nameEN?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  imageUrl?: string;
  isRecommended?: boolean;
  isAvailable?: boolean;
  isVisible?: boolean;
}
