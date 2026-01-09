/**
 * @file Customer Order Component
 * @description Main ordering interface for customers with menu browsing and cart
 * 
 * This component has been refactored to use:
 * - Custom hook (useCustomerSocket) for Socket.IO logic
 * - Sub-components (CategoryAccordion, HeaderButtons, OrderHistoryModal) for better organization
 * 
 * Features:
 * - Menu browsing by categories with accordion UI
 * - Add items to cart via MenuItem component
 * - Real-time order history display
 * - Call staff button functionality
 * - Order history modal
 * - Language switching
 * - Socket.IO real-time updates
 * 
 * @module components/customer/CustomerOrder
 * @requires react
 * @requires next/navigation
 * @requires swr
 */

"use client";

import { API_URL, fetcher } from "@/lib/utils";
import { ORDER_STATUS } from "@/config/enums";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { getErrorMessage } from '@/lib/errorHandler';
import { QrCode, Lock } from "lucide-react";
import FloatingCart from "@/components/customer/FloatingCart";
import TableDetector from "@/components/customer/TableDetector";
import { useCartStore } from "@/store/useCartStore";
import type { Dictionary } from "@/locales/dictionary";
import { logger } from "@/lib/logger";

// Custom Hook
import { useCustomerSocket } from "@/hooks/useCustomerSocket";

// Sub-components
import CategoryAccordion from "./CategoryAccordion";
import HeaderButtons from "./HeaderButtons";
import OrderHistoryModal from "./OrderHistoryModal";

// --- Type Definitions ---

interface Menu {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
  isRecommended: boolean;
  isAvailable: boolean;
}

interface Category {
  id: number;
  name: string;
  menus: Menu[];
}

interface HistoryItem {
  id: number;
  menuName: string;
  price: number;
  quantity: number;
  status: string;
  total: number;
  note?: string;
}

interface TableInfo {
  id: number;
  name: string;
  isAvailable: boolean;
  isCallingStaff: boolean;
}

interface CustomerOrderProps {
  dict: Dictionary;
  lang: string;
}

/**
 * Customer Order Component
 * 
 * Main ordering interface for customers to browse menu and place orders.
 * Refactored to use custom hooks and sub-components for better maintainability.
 * 
 * @param dict - Localized dictionary for translations
 * @param lang - Current language (th/en)
 */
export default function CustomerOrder({ dict, lang }: CustomerOrderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableIdParam = searchParams.get("tableId");

  const { totalItems } = useCartStore();
  const [showHistory, setShowHistory] = useState(false);

  // Data fetching
  const { data: menuData } = useSWR(`${API_URL}/api/v1/menus`, fetcher, {
    refreshInterval: 60000,
  });
  const categories: Category[] =
    menuData?.status === "success" ? menuData.data : [];

  const { data: tableData, mutate: mutateTable } = useSWR(
    tableIdParam ? `${API_URL}/api/v1/tables/${tableIdParam}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  const tableInfo: TableInfo | null =
    tableData?.status === "success" ? tableData.data : null;

  const { data: settingsData } = useSWR(`${API_URL}/api/v1/settings/name`, fetcher);
  const restaurantName =
    settingsData?.status === "success"
      ? settingsData.data
      : dict.common.loading;

  const { data: historyData, mutate: mutateHistory } = useSWR(
    showHistory && tableIdParam
      ? `${API_URL}/api/v1/bills/table/${tableIdParam}`
      : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  const historyItems: HistoryItem[] =
    historyData?.status === "success" ? historyData.data.items : [];

  // Custom hook for Socket.IO
  useCustomerSocket(tableIdParam, showHistory, mutateTable, mutateHistory);

  // --- Handlers ---

  const handleSwitchLang = () => {
    const newLang = lang === "en" ? "th" : "en";
    const currentQuery = searchParams.toString();
    router.push(`/${newLang}/order?${currentQuery}`);
  };

  const handleCallStaff = async () => {
    if (!tableIdParam || !tableInfo) return;

    const newStatus = !tableInfo.isCallingStaff;

    // Optimistic update
    mutateTable(
      {
        ...tableData,
        data: { ...tableInfo, isCallingStaff: newStatus },
      },
      false
    );

    try {
      await fetch(`${API_URL}/api/v1/tables/${tableIdParam}/call`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCalling: newStatus }),
      });

      if (newStatus) toast.success(dict.customer.alertCallStaff);
      else toast.info(dict.customer.alertCancelCall);

      mutateTable();
    } catch (error) {
      const message = getErrorMessage(error, dict);
      toast.error(message);
      mutateTable();
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return { label: `🕒 ${dict.kitchen.pending}`, color: "text-yellow-600" };
      case ORDER_STATUS.COOKING:
        return { label: `🍳 ${dict.kitchen.cooking}`, color: "text-orange-600" };
      case ORDER_STATUS.READY:
        return {
          label: `✨ ${dict.kitchen.ready}`,
          color: "text-green-600 animate-pulse font-bold",
        };
      case ORDER_STATUS.SERVED:
        return {
          label: `✅ ${dict.kitchen.served}`,
          color: "text-green-700 font-bold",
        };
      case ORDER_STATUS.COMPLETED:
        return {
          label: `💰 ${dict.customer.statusCompleted}`,
          color: "text-slate-500",
        };
      case ORDER_STATUS.CANCELLED:
        return {
          label: `❌ ${dict.staff.statusCancelled}`,
          color: "text-red-500 font-bold",
        };
      default:
        return { label: status, color: "text-slate-500" };
    }
  };

  // --- Render ---

  if (!tableIdParam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full">
          <div className="bg-slate-100 p-4 rounded-full mb-6">
            <QrCode size={64} className="text-slate-800" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {dict.customer.scanQr}
          </h1>
          <p className="text-slate-500 mb-6">{dict.customer.scanQrDesc}</p>
        </div>
      </div>
    );
  }

  if (!tableData && !menuData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        {dict.common.loading}
      </div>
    );
  }

  if (tableInfo && !tableInfo.isAvailable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full border-t-4 border-red-500">
          <div className="bg-red-50 p-4 rounded-full mb-6">
            <Lock size={64} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {dict.customer.tableClosed}
          </h1>
          <p className="text-slate-500 mb-6">{dict.customer.contactStaff}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-md min-h-screen bg-white pb-24 relative">
      <TableDetector />

      {/* Header */}
      <header className="mb-6 mt-4 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-3 border-b">
        <div>
          <h1 className="text-xl font-bold text-slate-900 line-clamp-1">
            {restaurantName}
          </h1>
          <p className="text-slate-500 text-xs">
            {dict.customer.table}:{" "}
            <span className="font-bold text-green-600">
              {tableInfo?.name || tableIdParam}
            </span>
          </p>
        </div>

        <HeaderButtons
          lang={lang}
          isCallingStaff={tableInfo?.isCallingStaff || false}
          onSwitchLang={handleSwitchLang}
          onCallStaff={handleCallStaff}
          onShowHistory={() => setShowHistory(true)}
          dict={dict}
        />
      </header>

      {/* Categories */}
      {categories.length === 0 ? (
        <div className="text-center p-10 bg-slate-50 rounded-lg border border-dashed">
          <p className="text-red-500 font-medium">{dict.admin.noMenu}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <CategoryAccordion key={cat.id} category={cat} dict={dict} />
          ))}
        </div>
      )}

      {/* Floating Cart */}
      {totalItems() > 0 && <FloatingCart dict={dict} />}

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        historyItems={historyItems}
        getStatusDisplay={getStatusDisplay}
        dict={dict}
      />
    </main>
  );
}