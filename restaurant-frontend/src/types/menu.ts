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
