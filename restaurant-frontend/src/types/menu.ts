/**
 * @file Menu Type Definitions
 * @description Type definitions for menu and category entities
 * 
 * This module provides:
 * - Menu interface for menu items
 * - Category interface for menu categories
 * - MenuFormData for form handling
 * 
 * @module types/menu
 * 
 * @see {@link components/admin/MenuManager} for usage
 */

// Menu-related types

export interface Menu {
  id: number;
  nameTH: string;
  nameEN?: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  category?: Category;
  isRecommended?: boolean;
  isAvailable?: boolean;
  isVisible?: boolean;
}

export interface Category {
  id: number;
  name: string;
  menus?: Menu[];
}

export interface MenuFormData {
  nameTH: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  isRecommended: boolean;
  isAvailable: boolean;
  isVisible: boolean;
}
