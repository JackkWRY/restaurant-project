/**
 * @file Sales Trend Chart Component
 * @description Bar chart for displaying sales trend
 * 
 * This component handles:
 * - Display 7-day sales trend
 * - Recharts bar chart configuration
 * - Responsive container
 * 
 * @module components/admin/SalesTrendChart
 * @requires react
 * @requires recharts
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";

interface SalesTrend {
  name: string;
  total: number;
  [key: string]: string | number | undefined;
}

interface SalesTrendChartProps {
  salesTrend: SalesTrend[];
  dict: Dictionary;
}

/**
 * Sales Trend Chart Component
 * 
 * Displays bar chart for 7-day sales trend.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function SalesTrendChart({
  salesTrend,
  dict,
}: SalesTrendChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
      <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
        <TrendingUp size={20} className="text-blue-500" />
        {dict.dashboard.salesTrend}
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesTrend}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `฿${value}`}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number | undefined) => [
                `฿${(value ?? 0).toLocaleString()}`,
                dict.dashboard.total,
              ]}
            />
            <Bar
              dataKey="total"
              fill="#8b5cf6"
              radius={[6, 6, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
