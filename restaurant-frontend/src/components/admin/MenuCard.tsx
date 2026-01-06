/**
 * @file Menu Card Component
 * @description Single menu row component for table display
 * 
 * This component handles:
 * - Display menu image thumbnail
 * - Display menu name, category, price
 * - Show recommended badge
 * - Toggle buttons (availability, visibility)
 * - Edit and delete buttons
 * 
 * @module components/admin/MenuCard
 * @requires react
 * @requires next/image
 */

"use client";

import Image from "next/image";
import { Pencil, Trash2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";
import type { Menu } from "@/hooks/useMenuForm";

interface MenuCardProps {
  menu: Menu;
  isEditing: boolean;
  onEdit: (menu: Menu) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, field: "isAvailable" | "isVisible") => void;
  dict: Dictionary;
}

/**
 * Menu Card Component
 * 
 * Displays a single menu item row in the table.
 * Shows image, name, price, status toggles, and action buttons.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function MenuCard({
  menu,
  isEditing,
  onEdit,
  onDelete,
  onToggle,
  dict,
}: MenuCardProps) {
  return (
    <tr
      className={`transition-colors ${
        isEditing ? "bg-blue-50" : "hover:bg-slate-50"
      }`}
    >
      {/* Image */}
      <td className="p-4 w-20">
        <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center text-slate-400 relative">
          {menu.imageUrl ? (
            <Image
              src={menu.imageUrl}
              alt={menu.nameTH}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <ImageIcon size={20} />
          )}
        </div>
      </td>

      {/* Name & Category */}
      <td className="p-4">
        <div className="font-bold text-slate-800">{menu.nameTH}</div>
        <div className="text-xs text-slate-500">
          {menu.category?.name || "-"}
        </div>
        {menu.isRecommended && (
          <span className="text-[10px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold">
            ★ {dict.admin.recommend}
          </span>
        )}
      </td>

      {/* Price */}
      <td className="p-4 font-bold text-slate-900">
        {dict.common.currency}
        {menu.price}
      </td>

      {/* Availability Toggle */}
      <td className="p-4 text-center">
        <button
          onClick={() => onToggle(menu.id, "isAvailable")}
          className={`px-3 py-1 rounded-full text-xs font-bold border w-24 transition-colors ${
            menu.isAvailable
              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
              : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
          }`}
        >
          {menu.isAvailable
            ? `🟢 ${dict.admin.available}`
            : `🔴 ${dict.admin.outOfStock}`}
        </button>
      </td>

      {/* Visibility Toggle */}
      <td className="p-4 text-center">
        <button
          onClick={() => onToggle(menu.id, "isVisible")}
          className={`px-3 py-1 rounded-full text-xs font-bold border w-24 transition-colors flex items-center justify-center gap-1 mx-auto ${
            menu.isVisible
              ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
          }`}
        >
          {menu.isVisible ? (
            <>
              <Eye size={12} /> {dict.admin.visible}
            </>
          ) : (
            <>
              <EyeOff size={12} /> {dict.admin.hidden}
            </>
          )}
        </button>
      </td>

      {/* Actions */}
      <td className="p-4 text-right">
        <div className="flex justify-end gap-1">
          <button
            onClick={() => onEdit(menu)}
            className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
            title={dict.admin.edit}
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(menu.id)}
            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
            title={dict.admin.delete}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
