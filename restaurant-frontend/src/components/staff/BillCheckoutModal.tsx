/**
 * @file Bill Checkout Modal Component
 * @description Modal for displaying bill and processing payment
 * 
 * This component handles:
 * - Display receipt-style bill
 * - Show all items with prices
 * - Calculate totals
 * - Show warning if items not served
 * - Confirm payment button
 * - Handle modal close
 * 
 * @module components/staff/BillCheckoutModal
 * @requires react
 */

"use client";

import { useMemo } from "react";
import { X, Receipt, Ban, Coins } from "lucide-react";
import { ORDER_STATUS } from "@/config/enums";
import type { Dictionary } from "@/locales/dictionary";
import type { OrderDetailItem } from "@/hooks/useStaffData";

interface BillCheckoutModalProps {
  isOpen: boolean;
  tableId: number | null;
  tableName: string;
  tableDetails: OrderDetailItem[];
  isLoading: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
  dict: Dictionary;
}

/**
 * Bill Checkout Modal Component
 * 
 * Displays modal for viewing bill and confirming payment.
 * Shows receipt-style layout with all items and totals.
 * 
 * @param props - Component props
 * @returns JSX.Element | null
 */
export default function BillCheckoutModal({
  isOpen,
  tableId,
  tableName,
  tableDetails,
  isLoading,
  onClose,
  onConfirmPayment,
  dict,
}: BillCheckoutModalProps) {
  // Calculate valid items (excluding cancelled)
  const validItems = useMemo(
    () => tableDetails.filter((item) => item.status !== ORDER_STATUS.CANCELLED),
    [tableDetails]
  );

  // Calculate total amount
  const totalAmount = useMemo(
    () => validItems.reduce((sum, item) => sum + item.total, 0),
    [validItems]
  );

  // Count unserved items
  const unservedCount = useMemo(
    () =>
      validItems.filter(
        (item) =>
          ![ORDER_STATUS.SERVED, ORDER_STATUS.COMPLETED].includes(
            item.status as ORDER_STATUS
          )
      ).length,
    [validItems]
  );

  if (!isOpen || tableId === null) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white text-center relative">
          <Receipt className="mx-auto mb-2 opacity-80" size={40} />
          <h2 className="text-2xl font-bold">{dict.staff.receipt}</h2>
          <p className="text-slate-400">Table: {tableName}</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <p className="text-center text-slate-500">{dict.common.loading}</p>
          ) : (
            <div className="space-y-4">
              {/* Items List */}
              <div className="space-y-2">
                {tableDetails.map((item, idx) => {
                  const isCancelled = item.status === ORDER_STATUS.CANCELLED;
                  return (
                    <div
                      key={idx}
                      className={`flex justify-between text-sm border-b border-dashed border-slate-200 pb-2 ${
                        isCancelled ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <span
                          className={`font-medium block ${
                            isCancelled ? "text-red-500 line-through" : "text-slate-800"
                          }`}
                        >
                          {item.menuName}
                        </span>

                        {item.note && (
                          <div className="text-xs text-slate-500 italic flex items-center gap-1">
                            📝 {item.note}
                          </div>
                        )}

                        <div className="text-xs text-slate-500 mt-0.5">
                          x{item.quantity} @ {dict.common.currency}
                          {item.price}
                          {isCancelled && (
                            <span className="text-red-500 font-bold ml-2">
                              ({dict.staff.statusCancelled})
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`font-bold ${
                          isCancelled ? "text-slate-300 line-through" : "text-slate-900"
                        }`}
                      >
                        {dict.common.currency}
                        {item.total}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>
                    {dict.staff.itemsCount} ({validItems.length})
                  </span>
                  <span>
                    {dict.common.currency}
                    {totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t">
                  <span>{dict.staff.total}</span>
                  <span>
                    {dict.common.currency}
                    {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Warning if unserved items */}
              {unservedCount > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex gap-2 items-start">
                  <Ban size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">{dict.staff.cannotCloseTitle}</span>
                    {unservedCount} {dict.staff.cannotCloseDesc}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
          >
            {dict.common.cancel}
          </button>
          <button
            onClick={onConfirmPayment}
            disabled={unservedCount > 0 || isLoading}
            className={`flex-1 py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 ${
              unservedCount > 0
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-lg"
            }`}
          >
            <Coins size={20} /> {dict.staff.receiveCash}
          </button>
        </div>
      </div>
    </div>
  );
}
