/**
 * @file Recent Orders Table Component
 * @description Table for displaying recent orders
 * 
 * This component handles:
 * - Display orders table
 * - Format time and status
 * - Handle loading state
 * - View button for details
 * 
 * @module components/admin/RecentOrdersTable
 * @requires react
 */

"use client";

import { Clock, Receipt, Eye } from "lucide-react";
import { ORDER_STATUS, BILL_STATUS } from "@/config/enums";
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

interface RecentOrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onViewOrder: (order: Order) => void;
  dict: Dictionary;
}

/**
 * Recent Orders Table Component
 * 
 * Displays table of recent orders with view details functionality.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function RecentOrdersTable({
  orders,
  isLoading,
  onViewOrder,
  dict,
}: RecentOrdersTableProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Receipt size={20} className="text-purple-600" />
          {dict.dashboard.recentOrders}
        </h3>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm font-semibold sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 bg-slate-50">{dict.dashboard.time}</th>
              <th className="p-4 bg-slate-50">{dict.dashboard.table}</th>
              <th className="p-4 bg-slate-50">{dict.dashboard.items}</th>
              <th className="p-4 bg-slate-50">{dict.dashboard.totalPrice}</th>
              <th className="p-4 text-center bg-slate-50">
                {dict.dashboard.status}
              </th>
              <th className="p-4 text-right bg-slate-50">
                {dict.dashboard.view}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-400 animate-pulse"
                >
                  {dict.dashboard.loading || "Loading..."}
                </td>
              </tr>
            ) : (
              <>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        {formatTime(order.createdAt)}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {order.tableId}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div
                            key={idx}
                            className={
                              item.status === ORDER_STATUS.CANCELLED
                                ? "line-through opacity-50 text-red-400"
                                : ""
                            }
                          >
                            {item.quantity}x {item.menuName}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-slate-400">
                            +{order.items.length - 2} items...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-purple-600">
                      ฿{Number(order.totalPrice).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border ${
                          order.status === ORDER_STATUS.COMPLETED
                            ? "bg-green-100 text-green-700 border-green-200"
                            : order.status === BILL_STATUS.PAID
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : order.status === ORDER_STATUS.PENDING
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-slate-400"
                    >
                      {dict.dashboard.noData}
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
