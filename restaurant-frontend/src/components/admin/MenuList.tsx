/**
 * @file Menu List Component
 * @description Table component for displaying menu list
 * 
 * This component handles:
 * - Display table header
 * - Map menu items to MenuCard components
 * - Show empty state
 * - Handle table layout
 * 
 * @module components/admin/MenuList
 * @requires react
 */

"use client";

import MenuCard from "./MenuCard";
import type { Dictionary } from "@/locales/dictionary";
import type { Menu } from "@/hooks/useMenuForm";

interface MenuListProps {
  menus: Menu[];
  editingId: number | null;
  onEdit: (menu: Menu) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, field: "isAvailable" | "isVisible") => void;
  dict: Dictionary;
}

/**
 * Menu List Component
 * 
 * Displays table of menu items with MenuCard components.
 * Shows empty state when no menus exist.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function MenuList({
  menus,
  editingId,
  onEdit,
  onDelete,
  onToggle,
  dict,
}: MenuListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-left">
        <thead className="bg-slate-100 text-slate-600 font-bold text-sm">
          <tr>
            <th className="p-4">{dict.admin.image}</th>
            <th className="p-4">{dict.admin.name}</th>
            <th className="p-4">{dict.admin.price}</th>
            <th className="p-4 text-center">{dict.admin.status}</th>
            <th className="p-4 text-center">{dict.admin.visibility}</th>
            <th className="p-4 text-right">{dict.admin.action}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {menus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              isEditing={editingId === menu.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              dict={dict}
            />
          ))}
        </tbody>
      </table>
      {menus.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          {dict.admin.noMenu}
        </div>
      )}
    </div>
  );
}
