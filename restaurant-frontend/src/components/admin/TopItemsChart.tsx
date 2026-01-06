/**
 * @file Top Items Chart Component
 * @description Pie chart for displaying top-selling items
 * 
 * This component handles:
 * - Display top items pie chart
 * - Legend with colors
 * - Handle empty state
 * 
 * @module components/admin/TopItemsChart
 * @requires react
 * @requires recharts
 */

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Award } from "lucide-react";
import { APP_CONFIG } from "@/config/constants";
import type { Dictionary } from "@/locales/dictionary";

const COLORS = APP_CONFIG.CHART_COLORS;

interface TopItem {
  name: string;
  value: number;
  [key: string]: string | number | undefined;
}

interface TopItemsChartProps {
  topItems: TopItem[];
  dict: Dictionary;
}

/**
 * Top Items Chart Component
 * 
 * Displays pie chart for top-selling items with legend.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function TopItemsChart({
  topItems,
  dict,
}: TopItemsChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
      <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
        <Award size={20} className="text-orange-500" />
        {dict.dashboard.bestSellers}
      </h3>
      <div className="flex-1 w-full min-h-0 relative">
        {topItems && topItems.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topItems}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {topItems.map((entry: TopItem, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            {dict.dashboard.noData}
          </div>
        )}

        <div className="absolute top-0 right-0 flex flex-col gap-2 text-xs">
          {topItems?.map((item: TopItem, index: number) => (
            <div key={index} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="text-slate-600 truncate max-w-[100px]">
                {item.name}
              </span>
              <span className="font-bold text-slate-800">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
