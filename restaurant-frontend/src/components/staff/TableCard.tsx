/**
 * @file Table Card Component
 * @description Card component for displaying single table status and actions
 * 
 * This component handles:
 * - Display table status (available, occupied, calling, new order, ready)
 * - Toggle availability switch
 * - Edit/Delete buttons (edit mode)
 * - View details and Check bill buttons
 * - Order link button
 * - Visual alerts (calling staff, new order, ready orders)
 * 
 * @module components/staff/TableCard
 * @requires react
 */

"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Pencil, Trash2, Eye, UtensilsCrossed, Bell, ShoppingBag, ChefHat } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";
import type { TableStatus } from "@/hooks/useStaffData";

interface TableCardProps {
  table: TableStatus;
  isEditingMode: boolean;
  hasNewOrder: boolean;
  onViewDetails: (id: number) => void;
  onCheckBill: (id: number) => void;
  onToggle: (id: number, status: boolean, isOccupied: boolean) => void;
  onAcknowledgeCall: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateName: (id: number, name: string) => void;
  dict: Dictionary;
  lang: string;
}

/**
 * Table Card Component
 * 
 * Displays a single table card with status, actions, and visual alerts.
 * Supports both normal mode and edit mode.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function TableCard({
  table,
  isEditingMode,
  hasNewOrder,
  onViewDetails,
  onCheckBill,
  onToggle,
  onAcknowledgeCall,
  onDelete,
  onUpdateName,
  dict,
  lang,
}: TableCardProps) {
  return (
    <Card
      className={`border-2 transition-all relative overflow-hidden ${
        table.isCallingStaff
          ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          : hasNewOrder
          ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          : !table.isAvailable
          ? "border-slate-200 bg-slate-100 opacity-70"
          : table.isOccupied && !isEditingMode
          ? "border-orange-400 bg-orange-50/50"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Closed Badge */}
      {!table.isAvailable && !isEditingMode && (
        <div className="absolute top-0 left-0 right-0 bg-slate-500 text-white text-xs text-center py-1 z-10">
          ⛔ {dict.staff.closed}
        </div>
      )}

      {/* Alert Badges */}
      {table.isCallingStaff ? (
        <div
          onClick={() => onAcknowledgeCall(table.id)}
          className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold text-center py-1 z-20 cursor-pointer hover:bg-red-700 flex justify-center items-center gap-1 animate-pulse"
        >
          <Bell size={12} className="fill-current" /> {dict.staff.callCustomer}
        </div>
      ) : hasNewOrder ? (
        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-xs font-bold text-center py-1 z-20 flex justify-center items-center gap-1 animate-pulse">
          <ShoppingBag size={12} className="fill-current" /> {dict.staff.newOrder}
        </div>
      ) : table.readyOrderCount > 0 ? (
        <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-xs font-bold text-center py-1 z-20 flex justify-center items-center gap-1 animate-bounce">
          <ChefHat size={12} /> {dict.staff.ready} ({table.readyOrderCount})
        </div>
      ) : null}

      {/* Card Header */}
      <CardHeader className="pb-2 mt-4">
        <div className="flex justify-between items-center">
          <CardTitle
            className={`text-2xl font-bold ${
              !table.isAvailable ? "text-slate-400" : "text-slate-800"
            }`}
          >
            {table.name}
          </CardTitle>

          {!isEditingMode ? (
            <div className="flex items-center gap-2">
              {/* Availability Toggle Switch */}
              <button
                onClick={() => onToggle(table.id, table.isAvailable, table.isOccupied)}
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${
                  table.isAvailable
                    ? table.isOccupied
                      ? "bg-green-500/50 cursor-not-allowed"
                      : "bg-green-500"
                    : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    table.isAvailable ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => onUpdateName(table.id, table.name)}
                className="p-1 bg-slate-100 rounded text-blue-600"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onDelete(table.id)}
                className="p-1 bg-slate-100 rounded text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent>
        {!isEditingMode ? (
          <div className="flex flex-col space-y-1">
            <span className="text-slate-500 text-sm">{dict.staff.total}</span>
            <span
              className={`text-3xl font-bold ${
                table.isAvailable
                  ? table.isOccupied
                    ? "text-slate-900"
                    : "text-slate-300"
                  : "text-slate-300"
              }`}
            >
              {dict.common.currency}
              {table.totalAmount.toLocaleString()}
            </span>
            <button
              onClick={() => onViewDetails(table.id)}
              disabled={!table.isAvailable}
              className="text-xs text-blue-600 underline mt-1 flex items-center gap-1 hover:text-blue-800 disabled:text-slate-400 disabled:no-underline"
            >
              <Eye size={12} /> {dict.staff.viewDetails} ({table.activeOrders})
            </button>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-4 text-sm">
            ID: {table.id}
            <br />
            (Mode: Edit)
          </div>
        )}
      </CardContent>

      {/* Card Footer */}
      {!isEditingMode && (
        <CardFooter className="flex gap-2">
          <Link
            href={`/${lang}/order?tableId=${table.id}`}
            target="_blank"
            className={`flex-1 py-2 rounded-lg font-bold text-center text-sm flex items-center justify-center gap-1 transition-colors ${
              table.isAvailable
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-slate-200 text-slate-400 pointer-events-none"
            }`}
          >
            <UtensilsCrossed size={16} /> {dict.staff.order}
          </Link>
          <button
            onClick={() => onCheckBill(table.id)}
            disabled={!table.isAvailable || !table.isOccupied}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
              table.isAvailable && table.isOccupied
                ? "bg-slate-900 text-white hover:bg-slate-700 shadow-md"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            💰 {dict.staff.checkBill}
          </button>
        </CardFooter>
      )}
    </Card>
  );
}
