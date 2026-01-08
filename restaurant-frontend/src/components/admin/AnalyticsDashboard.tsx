/**
 * @file Analytics Dashboard Component
 * @description Real-time analytics and statistics dashboard for administrators
 * 
 * This component has been refactored to use:
 * - Sub-components (SummaryCards, SalesTrendChart, TopItemsChart, RecentOrdersTable, OrderDetailModal)
 *   for better organization
 * 
 * Features:
 * - Display of today's sales and order count statistics
 * - Sales trend visualization with bar charts (7-day history)
 * - Top-selling items visualization with pie charts
 * - Recent orders table with real-time updates
 * - Order detail modal with item breakdown
 * 
 * @module components/admin/AnalyticsDashboard
 * @requires react
 * @requires swr
 */

"use client";

import { API_URL, authFetcher } from "@/lib/utils";
import { useState } from "react";
import useSWR from "swr";
import type { Dictionary } from "@/locales/dictionary";

// Sub-components
import SummaryCards from "./SummaryCards";
import SalesTrendChart from "./SalesTrendChart";
import TopItemsChart from "./TopItemsChart";
import RecentOrdersTable from "./RecentOrdersTable";
import OrderDetailModal from "./OrderDetailModal";

// --- Type Definitions ---

interface TopItem {
  name: string;
  value: number;
  [key: string]: string | number | undefined;
}

interface SalesTrend {
  name: string;
  total: number;
  [key: string]: string | number | undefined;
}

interface AnalyticsData {
  todayTotal: number;
  todayCount: number;
  salesTrend: SalesTrend[];
  topItems: TopItem[];
}

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

interface ApiResponse {
  status: string;
  data: AnalyticsData;
}

interface OrderHistoryResponse {
  status: string;
  data: Order[];
}

interface AnalyticsDashboardProps {
  dict: Dictionary;
}

/**
 * Analytics Dashboard Component
 * 
 * Displays real-time restaurant analytics including sales trends,
 * top-selling items, and recent order history with auto-refresh.
 * Refactored to use sub-components for better maintainability.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function AnalyticsDashboard({ dict }: AnalyticsDashboardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch summary data with 30-second auto-refresh
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useSWR<ApiResponse>(`${API_URL}/api/v1/analytics/summary`, authFetcher, {
    refreshInterval: 30000,
  });

  // Fetch recent orders with 10-second auto-refresh
  const { data: ordersData, isLoading: ordersLoading } =
    useSWR<OrderHistoryResponse>(
      `${API_URL}/api/v1/analytics/orders`,
      authFetcher,
      { refreshInterval: 10000 }
    );

  if (summaryError)
    return (
      <div className="p-8 text-red-500 text-center">
        {dict.dashboard.error}
      </div>
    );

  if (summaryLoading)
    return (
      <div className="p-8 text-slate-500 text-center animate-pulse">
        {dict.dashboard.loading}
      </div>
    );

  const { todayTotal, todayCount, salesTrend, topItems } =
    summaryData?.data || {};
  const recentOrders = ordersData?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <SummaryCards
        todayTotal={todayTotal || 0}
        todayCount={todayCount || 0}
        dict={dict}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesTrendChart salesTrend={salesTrend || []} dict={dict} />
        <TopItemsChart topItems={topItems || []} dict={dict} />
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable
        orders={recentOrders}
        isLoading={ordersLoading}
        onViewOrder={setSelectedOrder}
        dict={dict}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        dict={dict}
      />
    </div>
  );
}