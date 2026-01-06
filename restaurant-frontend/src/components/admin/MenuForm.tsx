/**
 * @file Menu Form Component
 * @description Form component for creating and editing menu items
 * 
 * This component handles:
 * - Display form fields (name, price, category, image)
 * - Display checkboxes (recommended, available, visible)
 * - Handle form submission
 * - Show edit/create mode badge
 * - Form validation
 * 
 * @module components/admin/MenuForm
 * @requires react
 */

"use client";

import { type ChangeEvent } from "react";
import { Save } from "lucide-react";
import ImageUploadField from "./ImageUploadField";
import type { Dictionary } from "@/locales/dictionary";

interface Category {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  isRecommended: boolean;
  isAvailable: boolean;
  isVisible: boolean;
}

interface MenuFormProps {
  isOpen: boolean;
  editingId: number | null;
  formData: FormData;
  categories: Category[];
  uploading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onFieldChange: (field: keyof FormData, value: string | boolean) => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  dict: Dictionary;
}

/**
 * Menu Form Component
 * 
 * Displays form for creating or editing menu items.
 * Shows all necessary fields and handles validation.
 * 
 * @param props - Component props
 * @returns JSX.Element | null
 */
export default function MenuForm({
  isOpen,
  editingId,
  formData,
  categories,
  uploading,
  onSubmit,
  onCancel,
  onFieldChange,
  onImageUpload,
  dict,
}: MenuFormProps) {
  if (!isOpen) return null;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-slate-50 p-6 rounded-xl border mb-6 animate-in fade-in slide-in-from-top-4 relative"
    >
      {/* Mode Badge */}
      <div
        className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded ${
          editingId
            ? "bg-blue-100 text-blue-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {editingId ? dict.admin.modeEdit : dict.admin.modeCreate}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            {dict.admin.name}
          </label>
          <input
            required
            type="text"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-200 outline-none"
            value={formData.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
          />
        </div>

        {/* Price Field */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            {dict.admin.price}
          </label>
          <input
            required
            type="number"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-200 outline-none"
            value={formData.price}
            onChange={(e) => onFieldChange("price", e.target.value)}
          />
        </div>

        {/* Category Field */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            {dict.admin.category}
          </label>
          <select
            required
            className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-purple-200 outline-none"
            value={formData.categoryId}
            onChange={(e) => onFieldChange("categoryId", e.target.value)}
          >
            <option value="">-- {dict.admin.category} --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload Field */}
        <ImageUploadField
          value={formData.imageUrl}
          onChange={(url) => onFieldChange("imageUrl", url)}
          uploading={uploading}
          onUpload={onImageUpload}
          dict={dict}
        />
      </div>

      {/* Checkboxes */}
      <div className="mt-4 flex flex-wrap gap-6 border-t pt-4 border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isRecommended"
            checked={formData.isRecommended}
            onChange={(e) => onFieldChange("isRecommended", e.target.checked)}
            className="w-5 h-5 accent-orange-500 cursor-pointer"
          />
          <label
            htmlFor="isRecommended"
            className="text-slate-700 font-bold cursor-pointer select-none"
          >
            {dict.admin.recommend} ★
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={(e) => onFieldChange("isAvailable", e.target.checked)}
            className="w-5 h-5 accent-green-600 cursor-pointer"
          />
          <label
            htmlFor="isAvailable"
            className="text-slate-700 font-bold cursor-pointer select-none"
          >
            {dict.admin.available}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isVisible"
            checked={formData.isVisible}
            onChange={(e) => onFieldChange("isVisible", e.target.checked)}
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
          <label
            htmlFor="isVisible"
            className="text-slate-700 font-bold cursor-pointer select-none"
          >
            {dict.admin.visible}
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="mt-6 flex gap-2">
        <button
          type="submit"
          disabled={uploading}
          className={`px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 ${
            editingId
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          } ${uploading ? "opacity-50" : ""}`}
        >
          <Save size={18} /> {editingId ? dict.admin.save : dict.admin.add}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg font-bold bg-slate-200 text-slate-600 hover:bg-slate-300"
          >
            {dict.admin.cancel}
          </button>
        )}
      </div>
    </form>
  );
}
