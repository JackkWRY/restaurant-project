/**
 * @file Menu Form Hook
 * @description Custom hook for managing menu form state and CRUD operations
 * 
 * This hook handles:
 * - Form state management (8 fields)
 * - Form reset and edit mode
 * - Image upload with validation
 * - Create/Update menu operations
 * - Delete menu with confirmation
 * - Quick toggle features (availability, visibility)
 * 
 * @module hooks/useMenuForm
 * @requires react
 */

import { useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { API_URL, authFetch } from '@/lib/utils';
import { menuService } from '@/services/menuService';
import { logger } from '@/lib/logger';
import type { Dictionary } from '@/locales/dictionary';

/**
 * Menu item data structure
 */
export interface Menu {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  category?: { name: string };
  isRecommended?: boolean;
  isAvailable?: boolean;
  isVisible?: boolean;
}

/**
 * Form data structure
 */
interface FormData {
  name: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  isRecommended: boolean;
  isAvailable: boolean;
  isVisible: boolean;
}

interface UseMenuFormReturn {
  // Form state
  isFormOpen: boolean;
  editingId: number | null;
  formData: FormData;
  uploading: boolean;

  // Form actions
  setFormOpen: (open: boolean) => void;
  resetForm: () => void;
  startEdit: (menu: Menu) => void;
  updateField: (field: keyof FormData, value: string | boolean) => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handleQuickToggle: (id: number, field: 'isAvailable' | 'isVisible') => Promise<void>;
}

/**
 * Menu Form Hook
 * 
 * Manages form state and handlers for menu CRUD operations.
 * Handles image upload, validation, and API calls.
 * 
 * @param mutateMenus - Function to refresh menu data
 * @param dict - Internationalization dictionary
 * @returns Form state and handlers
 * 
 * @example
 * ```typescript
 * const {
 *   isFormOpen,
 *   formData,
 *   handleSubmit,
 *   resetForm,
 * } = useMenuForm(mutateMenus, dict);
 * ```
 */
export function useMenuForm(
  mutateMenus: () => void,
  dict: Dictionary
): UseMenuFormReturn {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isRecommended: false,
    isAvailable: true,
    isVisible: true,
  });

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      categoryId: '',
      imageUrl: '',
      isRecommended: false,
      isAvailable: true,
      isVisible: true,
    });
    setEditingId(null);
    setIsFormOpen(false);
    setUploading(false);
  };

  /**
   * Start editing a menu item
   */
  const startEdit = (menu: Menu) => {
    setFormData({
      name: menu.nameTH,
      price: menu.price.toString(),
      categoryId: menu.categoryId.toString(),
      imageUrl: menu.imageUrl || '',
      isRecommended: menu.isRecommended || false,
      isAvailable: menu.isAvailable !== undefined ? menu.isAvailable : true,
      isVisible: menu.isVisible !== undefined ? menu.isVisible : true,
    });
    setEditingId(menu.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Update a single form field
   */
  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handle image upload with validation
   */
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      e.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File too large (${sizeMB}MB). Maximum size is 5MB.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const res = await authFetch(`${API_URL}/api/v1/upload`, {
        method: 'POST',
        body: formDataObj,
      });
      const data = await res.json();

      if (data.status === 'success') {
        const url = data.data?.url || data.url;
        updateField('imageUrl', url);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      logger.error('Upload Error:', error);
      toast.error('Upload error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /**
   * Handle form submission (create or update)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nameTH: formData.name,
      nameEN: formData.name,
      price: Number(formData.price),
      categoryId: Number(formData.categoryId),
      imageUrl: formData.imageUrl,
      isRecommended: formData.isRecommended,
      isAvailable: formData.isAvailable,
      isVisible: formData.isVisible,
    };

    try {
      if (editingId) {
        await menuService.updateMenu(editingId, payload);
        toast.success(`✅ ${dict.admin.alertSaved}`);
      } else {
        await menuService.createMenu(payload);
        toast.success(`✅ ${dict.admin.alertSaved}`);
      }

      resetForm();
      mutateMenus();
    } catch (error) {
      logger.error('Failed to save menu:', error);
      toast.error(dict.admin.alertFailed);
    }
  };

  /**
   * Handle menu deletion with confirmation
   */
  const handleDelete = async (id: number) => {
    if (!confirm(dict.admin.confirmDelete)) return;

    try {
      await menuService.deleteMenu(id);
      mutateMenus();
      toast.success('Menu deleted successfully!');
    } catch (error) {
      logger.error('Failed to delete menu:', error);
      toast.error('Failed to delete menu');
    }
  };

  /**
   * Handle quick toggle for availability or visibility
   */
  const handleQuickToggle = async (
    id: number,
    field: 'isAvailable' | 'isVisible'
  ) => {
    try {
      if (field === 'isAvailable') {
        await menuService.toggleAvailability(id);
      } else {
        await menuService.toggleVisibility(id);
      }
      mutateMenus();
      toast.success('Updated successfully!');
    } catch (error) {
      logger.error('Failed to toggle menu:', error);
      toast.error('Failed to update');
    }
  };

  return {
    isFormOpen,
    editingId,
    formData,
    uploading,
    setFormOpen: setIsFormOpen,
    resetForm,
    startEdit,
    updateField,
    handleImageUpload,
    handleSubmit,
    handleDelete,
    handleQuickToggle,
  };
}
