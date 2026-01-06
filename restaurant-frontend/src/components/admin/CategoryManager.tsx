/**
 * @file Category Manager Component
 * @description CRUD operations for menu categories
 * 
 * This component handles:
 * - Create new categories
 * - Update existing category names
 * - Delete categories (with confirmation)
 * - Display category list with menu count
 * 
 * State management:
 * - SWR for data fetching and cache management
 * - Local state for new category input
 * 
 * Features:
 * - Real-time category list updates
 * - Menu count per category
 * - Inline editing with prompts
 * - Delete confirmation dialog
 * 
 * @module components/admin/CategoryManager
 * @requires react
 * @requires swr
 * @requires lucide-react
 * 
 * @see {@link AdminDashboard} for parent dashboard
 * @see {@link MenuManager} for menu management
 */

"use client";

import { API_URL, authFetcher } from "@/lib/utils";
import { categoryService } from "@/services/categoryService";
import { useState } from "react";
import { logger } from "@/lib/logger";
import { List, Plus, Pencil, Trash2 } from "lucide-react";
import useSWR from "swr";
import type { Dictionary } from "@/locales/dictionary";

/**
 * Category data structure
 * @property {number} id - Category ID
 * @property {string} name - Category name
 * @property {object} [_count] - Menu count in this category
 */
interface Category {
  id: number;
  name: string;
  _count?: { menus: number };
}

/**
 * Props for CategoryManager component
 * 
 * @property {Dictionary} dict - Internationalization dictionary
 * 
 * @example
 * <CategoryManager dict={dictionary} />
 */
interface CategoryManagerProps {
  dict: Dictionary;
}

/**
 * Category Manager Component
 * 
 * Manages menu categories with full CRUD operations.
 * Displays menu count per category for reference.
 * 
 * @param props - Component props
 * @returns JSX.Element
 * 
 * @example
 * <CategoryManager dict={dictionary} />
 */
export default function CategoryManager({ dict }: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: catData, mutate } = useSWR(
    `${API_URL}/api/categories`,
    authFetcher
  );
  const categories: Category[] =
    catData?.status === "success" ? catData.data : [];
  const isLoading = !catData;

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await categoryService.createCategory(newCategoryName);
      setNewCategoryName("");
      mutate();
    } catch (error) {
      logger.error("Failed to create category:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(dict.admin.confirmDelete)) return;

    try {
      await categoryService.deleteCategory(id);
      mutate();
    } catch (error) {
      logger.error("Failed to delete category:", error);
    }
  };

  const handleUpdate = async (id: number, oldName: string) => {
    const newName = prompt(dict.admin.promptEdit, oldName);
    if (!newName || newName === oldName) return;

    try {
      await categoryService.updateCategory(id, newName);
      mutate();
    } catch (error) {
      logger.error("Failed to update category:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <List className="text-purple-600" />
        {dict.admin.manageCategories}
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder={dict.admin.placeholderCategory}
          className="flex-1 border p-3 rounded-lg bg-slate-50 focus:bg-white transition-colors"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus size={20} /> {dict.admin.add}
        </button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">{dict.common.loading}</p>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex justify-between items-center bg-white border p-4 rounded-xl hover:shadow-md transition-shadow group"
            >
              <div>
                <span className="font-bold text-lg text-slate-800">
                  {cat.name}
                </span>
                <span className="ml-3 text-sm text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  {cat._count?.menus || 0} {dict.admin.menuCount}
                </span>
              </div>
              <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleUpdate(cat.id, cat.name)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-center text-slate-400 py-10">
              {dict.admin.noCategory}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
