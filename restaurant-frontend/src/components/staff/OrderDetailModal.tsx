/**
 * @file Order Detail Modal Component
 * @description Modal for viewing and managing order details
 * 
 * This component handles:
 * - Display order items in table format
 * - Show item notes and "NEW" badges
 * - Status dropdown for each item
 * - Cancel order functionality
 * - Calculate total amount
 * - Handle modal close
 * 
 * @module components/staff/OrderDetailModal
 * @requires react
 */

"use client";

import { useMemo } from "react";
import { X, UtensilsCrossed, Sparkles } from "lucide-react";
import { ORDER_STATUS } from "@/config/enums";
import type { Dictionary } from "@/locales/dictionary";
import type { OrderDetailItem } from "@/hooks/useStaffData";

interface OrderDetailModalProps {
  isOpen: boolean;
  tableId: number | null;
  tableName: string;
  tableDetails: OrderDetailItem[];
  isLoading: boolean;
  newOrderIds: number[];
  onClose: () => void;
  onStatusChange: (itemId: number, status: string, menuName: string) => void;
  dict: Dictionary;
}

/**
 * Order Detail Modal Component
 * 
 * Displays modal for viewing and managing order details.
 * Shows order items with status controls and notes.
 * 
 * @param props - Component props
 * @returns JSX.Element | null
 */
export default function OrderDetailModal({
  isOpen,
  tableId,
  tableName,
  tableDetails,
  isLoading,
  newOrderIds,
  onClose,
  onStatusChange,
  dict,
}: OrderDetailModalProps) {
  // Calculate total amount (excluding cancelled items)
  const totalAmount = useMemo(() => {
    return tableDetails
      .filter((item) => item.status !== ORDER_STATUS.CANCELLED)
      .reduce((sum, item) => sum + item.total, 0);
  }, [tableDetails]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case ORDER_STATUS.COOKING:
        return "text-orange-600 bg-orange-50 border-orange-200";
      case ORDER_STATUS.READY:
        return "text-green-600 bg-green-50 border-green-200 font-bold";
      case ORDER_STATUS.SERVED:
        return "text-blue-700 bg-blue-50 border-blue-200 font-bold";
      case ORDER_STATUS.COMPLETED:
        return "text-slate-500 bg-slate-50 border-slate-200";
      case ORDER_STATUS.CANCELLED:
        return "text-red-500 bg-red-50 border-red-200 line-through";
      default:
        return "text-slate-500";
    }
  };

  if (!isOpen || tableId === null) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UtensilsCrossed size={20} /> {dict.menu.foods} : {tableName}
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <p className="text-center text-slate-500 py-10">{dict.common.loading}</p>
          ) : tableDetails.length === 0 ? (
            <div className="text-center py-10 text-slate-500">{dict.staff.noOrders}</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-2 rounded-l">{dict.admin.name}</th>
                  <th className="p-2 text-center">{dict.admin.status}</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right rounded-r">{dict.staff.total}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tableDetails.map((item, idx) => {
                  const isCancelled = item.status === ORDER_STATUS.CANCELLED;
                  const isNewItem = newOrderIds.includes(item.orderId);
                  const statusColor = getStatusColor(item.status);

                  return (
                    <tr
                      key={`${item.id}-${idx}`}
                      className={`${
                        isCancelled
                          ? "bg-slate-50 opacity-60"
                          : isNewItem
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      {/* Menu Name */}
                      <td className="p-2 max-w-[150px]">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <span
                              className={`font-medium block truncate ${
                                isCancelled ? "line-through text-slate-500" : "text-slate-800"
                              }`}
                            >
                              {item.menuName}
                            </span>
                            {item.note && (
                              <div className="text-xs text-red-500 italic break-words mt-0.5">
                                *{item.note}
                              </div>
                            )}
                          </div>
                          {isNewItem && !isCancelled && (
                            <span className="shrink-0 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 animate-pulse">
                              <Sparkles size={10} /> {dict.staff.new}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-2 text-center">
                        {!isCancelled ? (
                          <select
                            value={item.status}
                            onChange={(e) =>
                              onStatusChange(item.id, e.target.value, item.menuName)
                            }
                            className={`text-xs border rounded p-1 font-bold outline-none cursor-pointer ${statusColor}`}
                          >
                            <option value={ORDER_STATUS.PENDING}>
                              🕒 {dict.kitchen.pending}
                            </option>
                            <option value={ORDER_STATUS.COOKING}>
                              🍳 {dict.kitchen.cooking}
                            </option>
                            <option value={ORDER_STATUS.READY}>
                              ✨ {dict.kitchen.ready}
                            </option>
                            <option value={ORDER_STATUS.SERVED}>
                              ✅ {dict.kitchen.served}
                            </option>
                            <option value={ORDER_STATUS.CANCELLED}>
                              ❌ {dict.common.cancel}
                            </option>
                          </select>
                        ) : (
                          <span className="text-xs text-red-500 font-bold border border-red-200 bg-red-50 px-2 py-1 rounded">
                            {dict.staff.statusCancelled}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="p-2 text-center text-slate-600">x{item.quantity}</td>

                      {/* Total */}
                      <td className="p-2 text-right font-bold text-slate-900">
                        {isCancelled ? (
                          <span className="line-through text-slate-400">
                            {dict.common.currency}
                            {item.total}
                          </span>
                        ) : (
                          `${dict.common.currency}${item.total}`
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-slate-600">{dict.staff.total}</span>
            <span className="text-2xl font-bold text-slate-900">
              {dict.common.currency}
              {totalAmount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-slate-200 text-slate-600 py-3 rounded-lg font-bold"
          >
            {dict.common.back}
          </button>
        </div>
      </div>
    </div>
  );
}
