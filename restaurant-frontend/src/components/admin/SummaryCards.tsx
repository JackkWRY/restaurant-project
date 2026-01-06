/**
 * @file Summary Cards Component
 * @description Display summary statistics cards for analytics dashboard
 * 
 * This component handles:
 * - Display today's sales card
 * - Display today's orders card
 * - Reusable card layout with icons
 * 
 * @module components/admin/SummaryCards
 * @requires react
 */

"use client";

import { DollarSign, ShoppingBag } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";

interface SummaryCardsProps {
  todayTotal: number;
  todayCount: number;
  dict: Dictionary;
}

/**
 * Summary Cards Component
 * 
 * Displays summary statistics cards for today's sales and orders.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function SummaryCards({
  todayTotal,
  todayCount,
  dict,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Sales Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div className="p-4 bg-green-100 text-green-600 rounded-full shadow-inner">
          <DollarSign size={32} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">
            {dict.dashboard.todaySales}
          </p>
          <h3 className="text-3xl font-bold text-slate-800">
            ฿{todayTotal?.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Orders Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div className="p-4 bg-purple-100 text-purple-600 rounded-full shadow-inner">
          <ShoppingBag size={32} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">
            {dict.dashboard.todayOrders}
          </p>
          <h3 className="text-3xl font-bold text-slate-800">
            {todayCount}{" "}
            <span className="text-sm font-normal text-slate-400">
              {dict.dashboard.bills}
            </span>
          </h3>
        </div>
      </div>
    </div>
  );
}
