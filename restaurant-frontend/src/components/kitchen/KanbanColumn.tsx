/**
 * @file Kanban Column Component
 * @description Reusable Kanban column component for kitchen dashboard
 * 
 * This component handles:
 * - Display column header with icon and count
 * - Render list of KitchenCard components
 * - Handle scrolling
 * - Show empty state
 * 
 * @module components/kitchen/KanbanColumn
 * @requires react
 */

"use client";

import KitchenCard from "./KitchenCard";
import type { KitchenItem } from "@/hooks/useKitchenData";
import { ORDER_STATUS } from "@/config/enums";

type ItemStatus = ORDER_STATUS;

interface KanbanColumnProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: KitchenItem[];
  btnLabel: string;
  btnColor: string;
  onAction: (itemId: number, newStatus: ItemStatus) => void;
  nextStatus: ItemStatus;
}

/**
 * Kanban Column Component
 * 
 * Displays a column in the Kanban board.
 * Shows header, item count, and list of kitchen cards.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function KanbanColumn({
  title,
  icon,
  color,
  items,
  btnLabel,
  btnColor,
  onAction,
  nextStatus,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <h2
        className={`shrink-0 font-bold text-lg ${color} flex items-center gap-2 p-4 pb-2 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm z-10`}
      >
        {icon} {title}
        <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">
          {items.length}
        </span>
      </h2>
      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 custom-scrollbar">
        {items.map((item) => (
          <KitchenCard
            key={item.id}
            item={item}
            btnLabel={btnLabel}
            btnColor={btnColor}
            onAction={() => onAction(item.id, nextStatus)}
          />
        ))}
      </div>
    </div>
  );
}
