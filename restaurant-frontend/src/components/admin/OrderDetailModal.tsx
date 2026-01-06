/**
 * @file Order Detail Modal Component
 * @description Modal for displaying order details
 * 
 * This component handles:
 * - Display order details
 * - Show items with notes
 * - Calculate total
 * - Handle cancelled items
 * 
 * @module components/admin/OrderDetailModal
 * @requires react
 */

"use client";

import { X, MessageSquareText } from "lucide-react";
import { ORDER_STATUS } from "@/config/enums";
import type { Dictionary } from "@/locales/dictionary";

interface OrderItem {
  id: number;
  menuName: string;
  quantity: number;
  price: number;
  note?: string | null;
  status: string;
}

interface Order {
  id: string;
  tableId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  dict: Dictionary;
}

/**
 * Order Detail Modal Component
 * 
 * Displays modal with order details including items, notes, and total.
 * 
 * @param props - Component props
 * @returns JSX.Element | null
 */
export default function OrderDetailModal({
  order,
  onClose,
  dict,
}: OrderDetailModalProps) {
  if (!order) return null;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              {dict.dashboard.orderDetail || "Order Detail"}
            </h3>
            <p className="text-xs text-slate-500">
              #{order.id} • {formatDate(order.createdAt)}{" "}
              {formatTime(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-dashed">
            <span className="text-slate-500 font-bold">
              {dict.dashboard.table}
            </span>
            <span className="text-2xl font-bold text-purple-600">
              {order.tableId}
            </span>
          </div>

          <table className="w-full text-sm">
            <thead className="text-slate-500 border-b">
              <tr>
                <th className="text-left py-2">{dict.dashboard.items}</th>
                <th className="text-center py-2">{dict.dashboard.quantity}</th>
                <th className="text-right py-2">{dict.dashboard.subtotal}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <tr
                  key={idx}
                  className={
                    item.status === ORDER_STATUS.CANCELLED
                      ? "bg-red-50/50"
                      : ""
                  }
                >
                  <td className="py-3">
                    <div
                      className={`font-medium ${
                        item.status === ORDER_STATUS.CANCELLED
                          ? "text-red-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {item.menuName}
                    </div>

                    {item.note && (
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MessageSquareText size={10} /> {item.note}
                      </div>
                    )}

                    {item.status === ORDER_STATUS.CANCELLED && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td
                    className={`py-3 text-center ${
                      item.status === ORDER_STATUS.CANCELLED
                        ? "text-red-300"
                        : "text-slate-600"
                    }`}
                  >
                    x{item.quantity}
                  </td>
                  <td className="py-3 text-right font-bold">
                    {item.status === ORDER_STATUS.CANCELLED ? (
                      <span className="text-slate-300 line-through">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-800">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-4 border-t flex justify-between items-center">
          <span className="text-slate-500 font-bold">
            {dict.dashboard.totalPrice}
          </span>
          <span className="text-2xl font-bold text-purple-600">
            ฿{Number(order.totalPrice).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
