/**
 * @file Header Buttons Component
 * @description Header buttons for customer interface (language, call staff, history)
 * 
 * This component handles:
 * - Language switch button
 * - Call staff button with animation
 * - History button
 * - Button click handlers
 * 
 * @module components/customer/HeaderButtons
 * @requires react
 */

"use client";

import { Globe, Bell, History } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";

interface HeaderButtonsProps {
  lang: string;
  isCallingStaff: boolean;
  onSwitchLang: () => void;
  onCallStaff: () => void;
  onShowHistory: () => void;
  dict: Dictionary;
}

/**
 * Header Buttons Component
 * 
 * Displays header action buttons for customer interface.
 * Includes language toggle, call staff, and order history buttons.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function HeaderButtons({
  lang,
  isCallingStaff,
  onSwitchLang,
  onCallStaff,
  onShowHistory,
}: HeaderButtonsProps) {
  return (
    <div className="flex gap-2 shrink-0">
      {/* Language Toggle */}
      <button
        onClick={onSwitchLang}
        className="p-2 rounded-full bg-white text-slate-600 shadow-sm border border-slate-200 flex items-center gap-1 text-xs font-bold px-3 hover:bg-slate-50"
      >
        <Globe size={16} /> {lang.toUpperCase()}
      </button>

      {/* Call Staff Button */}
      <button
        onClick={onCallStaff}
        className={`p-2 rounded-full shadow-sm border transition-all ${
          isCallingStaff
            ? "bg-red-100 text-red-600 border-red-200 animate-pulse"
            : "bg-white text-slate-600 border-slate-200"
        }`}
      >
        <Bell size={20} className={isCallingStaff ? "fill-current" : ""} />
      </button>

      {/* History Button */}
      <button
        onClick={onShowHistory}
        className="p-2 rounded-full bg-white text-slate-600 shadow-sm border border-slate-200 relative"
      >
        <History size={20} />
      </button>
    </div>
  );
}
