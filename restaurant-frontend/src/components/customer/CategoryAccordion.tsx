/**
 * @file Category Accordion Component
 * @description Accordion component for displaying category and menus
 * 
 * This component handles:
 * - Display category name and menu count
 * - Toggle open/close state
 * - Map menus to MenuItem components
 * - Show empty state
 * 
 * @module components/customer/CategoryAccordion
 * @requires react
 */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import MenuItem from "./MenuItem";
import type { Dictionary } from "@/locales/dictionary";

interface Menu {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
  isRecommended: boolean;
  isAvailable: boolean;
}

interface Category {
  id: number;
  name: string;
  menus: Menu[];
}

interface CategoryAccordionProps {
  category: Category;
  dict: Dictionary;
}

/**
 * Category Accordion Component
 * 
 * Displays category with collapsible menu list.
 * Shows menu count and toggles between open/closed states.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function CategoryAccordion({
  category,
  dict,
}: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-4 text-left transition-colors ${
          isOpen
            ? "bg-slate-50 text-slate-900"
            : "bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{category.name}</span>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
            {category.menus.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="text-slate-400" />
        ) : (
          <ChevronDown className="text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 bg-white border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid gap-4">
            {category.menus.map((menu) => (
              <MenuItem
                key={menu.id}
                id={menu.id}
                nameTH={menu.nameTH}
                price={menu.price}
                imageUrl={menu.imageUrl}
                isRecommended={menu.isRecommended}
                isAvailable={menu.isAvailable}
                dict={dict}
              />
            ))}
            {category.menus.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">
                {dict.customer.noMenuInCategory}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
