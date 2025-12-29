/**
 * Menu Types
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
