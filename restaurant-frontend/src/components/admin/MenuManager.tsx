/**
 * @file Menu Manager Component
 * @description Comprehensive menu item management with CRUD operations
 * 
 * This component has been refactored to use:
 * - Custom hook (useMenuForm) for form state and handlers
 * - Sub-components (MenuForm, MenuList, MenuCard, ImageUploadField) for better organization
 * 
 * Features:
 * - Full CRUD operations for menu items
 * - Image upload with validation
 * - Quick toggle features (availability, visibility)
 * - Real-time updates with SWR
 * 
 * @module components/admin/MenuManager
 * @requires react
 * @requires swr
 */

"use client";

import { API_URL, authFetcher } from "@/lib/utils";
import { Utensils, Plus, X } from "lucide-react";
import useSWR from "swr";
import type { Dictionary } from "@/locales/dictionary";
import { useMenuForm } from "@/hooks/useMenuForm";
import MenuForm from "./MenuForm";
import MenuList from "./MenuList";

/**
 * Category data structure
 */
interface Category {
  id: number;
  name: string;
}

/**
 * Props for MenuManager component
 */
interface MenuManagerProps {
  dict: Dictionary;
}

/**
 * Menu Manager Component
 * 
 * Manages menu items with full CRUD operations.
 * Refactored to use custom hooks and sub-components for better maintainability.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function MenuManager({ dict }: MenuManagerProps) {
  // Data fetching
  const { data: menusData, mutate: mutateMenus } = useSWR(
    `${API_URL}/api/v1/menus?scope=all`,
    authFetcher
  );
  const { data: catsData } = useSWR(`${API_URL}/api/v1/categories`, authFetcher);

  // Transform data
  const menus =
    menusData?.status === "success"
      ? Array.isArray(menusData.data)
        ? menusData.data
        : menusData.data?.menus || []
      : [];
  const categories: Category[] =
    catsData?.status === "success" ? catsData.data : [];

  // Custom hook for form management
  const {
    isFormOpen,
    editingId,
    formData,
    uploading,
    setFormOpen,
    resetForm,
    startEdit,
    updateField,
    handleImageUpload,
    handleSubmit,
    handleDelete,
    handleQuickToggle,
  } = useMenuForm(mutateMenus, dict);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Utensils className="text-purple-600" />
          {dict.admin.manageMenus} ({menus.length})
        </h2>
        <button
          onClick={() => (isFormOpen ? resetForm() : setFormOpen(true))}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${
            isFormOpen
              ? "bg-slate-200 text-slate-600"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {isFormOpen ? (
            <>
              <X size={18} /> {dict.admin.cancel}
            </>
          ) : (
            <>
              <Plus size={18} /> {dict.admin.add}
            </>
          )}
        </button>
      </div>

      {/* Form Component */}
      <MenuForm
        isOpen={isFormOpen}
        editingId={editingId}
        formData={formData}
        categories={categories}
        uploading={uploading}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        onFieldChange={updateField}
        onImageUpload={handleImageUpload}
        dict={dict}
      />

      {/* List Component */}
      <MenuList
        menus={menus}
        editingId={editingId}
        onEdit={startEdit}
        onDelete={handleDelete}
        onToggle={handleQuickToggle}
        dict={dict}
      />
    </div>
  );
}
