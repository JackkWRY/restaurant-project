/**
 * @file Kitchen Card Component
 * @description Card component for displaying order item in kitchen
 * 
 * This component handles:
 * - Display table name and order ID
 * - Show menu name and quantity
 * - Display customer notes
 * - Action button with custom label and color
 * 
 * @module components/kitchen/KitchenCard
 * @requires react
 */

"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { KitchenItem } from "@/hooks/useKitchenData";

interface KitchenCardProps {
  item: KitchenItem;
  btnLabel: string;
  btnColor: string;
  onAction: () => void;
}

/**
 * Kitchen Card Component
 * 
 * Displays order item card for kitchen staff.
 * Shows item details and action button.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function KitchenCard({
  item,
  btnLabel,
  btnColor,
  onAction,
}: KitchenCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-600 text-slate-100 shadow-lg">
      <CardHeader className="p-3 bg-slate-900/50 flex flex-row justify-between items-start border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
            {item.tableName}
          </span>
          <span className="text-xs text-slate-400">#{item.orderId}</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {new Date(item.createdAt).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-white leading-tight">
              {item.menuName}
            </div>
            {item.note && (
              <div className="text-red-400 text-sm italic mt-1 break-words">
                *{item.note}
              </div>
            )}
          </div>
          <div className="bg-slate-700 px-3 py-1 rounded-lg ml-2">
            <span className="text-xl font-bold text-yellow-500">
              x{item.quantity}
            </span>
          </div>
        </div>

        <button
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 shadow-md ${btnColor}`}
          onClick={onAction}
        >
          {btnLabel}
        </button>
      </CardContent>
    </Card>
  );
}
