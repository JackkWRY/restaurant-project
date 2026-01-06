/**
 * @file Table Management Section Component
 * @description Section for creating new tables in edit mode
 * 
 * This component handles:
 * - Display "Add Table" button
 * - Show create table form
 * - Handle form submission
 * - Handle cancel action
 * 
 * @module components/staff/TableManagementSection
 * @requires react
 */

"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";

interface TableManagementSectionProps {
  isVisible: boolean;
  onCreateTable: (name: string) => Promise<void>;
  dict: Dictionary;
}

/**
 * Table Management Section Component
 * 
 * Displays section for creating new tables when in edit mode.
 * Shows "Add Table" button or create form based on state.
 * 
 * @param props - Component props
 * @returns JSX.Element | null
 */
export default function TableManagementSection({
  isVisible,
  onCreateTable,
  dict,
}: TableManagementSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  if (!isVisible) return null;

  const handleSubmit = async () => {
    if (!newTableName.trim()) return;
    
    await onCreateTable(newTableName);
    setNewTableName("");
    setIsCreating(false);
  };

  const handleCancel = () => {
    setNewTableName("");
    setIsCreating(false);
  };

  return (
    <div className="mb-6">
      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full bg-slate-200 border-2 border-dashed border-slate-400 text-slate-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300"
        >
          <Plus size={24} /> {dict.staff.addTable}
        </button>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-sm flex gap-2 items-center animate-in fade-in zoom-in">
          <input
            type="text"
            placeholder={dict.staff.placeholderTable}
            className="border p-2 rounded-lg flex-1"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
          >
            {dict.common.save}
          </button>
          <button
            onClick={handleCancel}
            className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <X size={18} /> {dict.common.cancel}
          </button>
        </div>
      )}
    </div>
  );
}
