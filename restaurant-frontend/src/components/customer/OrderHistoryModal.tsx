/**
 * @file Order History Modal Component
 * @description Modal for displaying order history
 * 
 * This component handles:
 * - Display modal overlay
 * - Show order history items
 * - Display status with colors
 * - Show notes and quantities
 * - Calculate total amount
 * - Handle modal close
 * 
 * @module components/customer/OrderHistoryModal
 * @requires react
 */

"use client";

import { History, X } from "lucide-react";
import { ORDER_STATUS } from "@/config/enums";
import type { Dictionary } from "@/locales/dictionary";

interface HistoryItem {
  id: number;
  menuName: string;
  price: number;
  quantity: number;
  status: string;
  total: number;
  note?: string;
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: HistoryItem[];
  getStatusDisplay: (status: string) => { label: string; color: string };
  dict: Dictionary;
}

/**
 * Order History Modal Component
 * 
 * Displays modal with order history items.
 * Shows item details, status, and total amount.
 * 
 * @param props - Component props
 * @returns JSX.Element | null
 */
export default function OrderHistoryModal({
  isOpen,
  onClose,
  historyItems,
  getStatusDisplay,
  dict,
}: OrderHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <History size={18} /> {dict.customer.orderHistory}
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {historyItems.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {dict.customer.noHistory}
            </p>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item, idx) => {
                const { label, color } = getStatusDisplay(item.status);
                const isCancelled = item.status === ORDER_STATUS.CANCELLED;
                
                return (
                  <div
                    key={idx}
                    className={`flex justify-between items-start border-b pb-3 last:border-0 ${
                      isCancelled ? "bg-slate-50 opacity-60" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-bold text-lg leading-tight break-words ${
                          isCancelled
                            ? "line-through text-slate-500"
                            : "text-slate-800"
                        }`}
                      >
                        {item.menuName}
                      </div>

                      {item.note && (
                        <div className="text-xs text-red-500 italic mt-0.5 break-words">
                          *{item.note}
                        </div>
                      )}

                      <div className={`text-xs mt-1 ${color}`}>{label}</div>
                    </div>
                    
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-sm text-slate-500">
                        x{item.quantity}
                      </div>
                      <div
                        className={`font-bold ${
                          isCancelled
                            ? "line-through text-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {dict.common.currency}
                        {item.total}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t">
          <div className="flex justify-between text-lg font-bold text-slate-900">
            <span>{dict.staff.total}</span>
            <span>
              {dict.common.currency}
              {historyItems
                .filter((i) => i.status !== ORDER_STATUS.CANCELLED)
                .reduce((sum, i) => sum + i.total, 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
