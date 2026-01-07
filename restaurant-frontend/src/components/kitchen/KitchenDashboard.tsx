/**
 * @file Kitchen Dashboard Component
 * @description Kanban-style dashboard for kitchen staff to manage order preparation
 * 
 * This component has been refactored to use:
 * - Custom hooks (useKitchenSocket, useKitchenData) for logic separation
 * - Sub-components (KitchenCard, KanbanColumn) for better organization
 * 
 * Features:
 * - Three-column Kanban layout (Pending → Cooking → Ready)
 * - Real-time order updates via Socket.IO
 * - Audio notifications for new orders
 * - Status updates with action buttons
 * 
 * @module components/kitchen/KitchenDashboard
 * @requires react
 * @requires next/navigation
 */

"use client";

import { orderService } from "@/services/orderService";
import { ORDER_STATUS, ROLE } from "@/config/enums";
import Link from "next/link";
import {
  Clock,
  ChefHat,
  BellRing,
  LogOut,
  LayoutDashboard,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import type { Dictionary } from "@/locales/dictionary";
import { logger } from "@/lib/logger";

// Custom Hooks
import { useAuth } from "@/hooks";
import { useKitchenSocket } from "@/hooks/useKitchenSocket";
import { useKitchenData } from "@/hooks/useKitchenData";

// Sub-components
import KanbanColumn from "./KanbanColumn";

type ItemStatus = ORDER_STATUS;

interface KitchenDashboardProps {
  dict: Dictionary;
  lang: string;
}

/**
 * Kitchen Dashboard Component
 * 
 * Kanban-style dashboard for kitchen staff to manage order preparation.
 * Refactored to use custom hooks and sub-components for better maintainability.
 * 
 * @param dict - Localized dictionary for translations
 * @param lang - Current language (th/en)
 */
export default function KitchenDashboard({
  dict,
  lang,
}: KitchenDashboardProps) {
  const { user, logout } = useAuth(lang);
  const toggleLang = lang === "en" ? "th" : "en";

  // Custom hooks
  const { items, isLoading, error, mutate } = useKitchenData();
  useKitchenSocket(mutate);

  const handleLogout = async () => {
    if (confirm(dict.common.logoutConfirm)) {
      await logout();
      toast.success(dict.common.logout);
    }
  };

  const handleUpdateStatus = async (itemId: number, newStatus: ItemStatus) => {
    try {
      await orderService.updateItemStatus(itemId, newStatus);
      mutate();
    } catch (error) {
      logger.error(error);
    }
  };

  // Filter items by status
  const pendingItems = items.filter((i) => i.status === ORDER_STATUS.PENDING);
  const cookingItems = items.filter((i) => i.status === ORDER_STATUS.COOKING);
  const readyItems = items.filter((i) => i.status === ORDER_STATUS.READY);

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">
        {dict.common.loading}
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">
        {dict.common.error}
      </div>
    );

  return (
    <main className="h-screen flex flex-col p-4 bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          👨‍🍳 {dict.kitchen.title}
          <span className="text-xs font-normal bg-green-600 px-3 py-1 rounded-full animate-pulse">
            {dict.kitchen.live}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          {user?.role === ROLE.ADMIN && (
            <Link
              href={`/${lang}/admin`}
              className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full transition-colors"
              title={dict.admin.title}
            >
              <LayoutDashboard size={20} />
            </Link>
          )}

          <Link
            href={`/${toggleLang}/kitchen`}
            className="flex items-center gap-1 text-sm font-bold text-slate-300 hover:text-white px-3 py-1 bg-slate-800 rounded-full border border-slate-700 hover:bg-slate-700 transition-all"
          >
            <Globe size={16} /> {lang.toUpperCase()}
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition-colors"
            title={dict.common.logout}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Kanban Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        <KanbanColumn
          title={dict.kitchen.pending}
          icon={<Clock />}
          color="text-yellow-400"
          items={pendingItems}
          btnLabel={`🔥 ${dict.kitchen.startCook}`}
          btnColor="bg-yellow-600 hover:bg-yellow-700"
          onAction={handleUpdateStatus}
          nextStatus={ORDER_STATUS.COOKING}
        />

        <KanbanColumn
          title={dict.kitchen.cooking}
          icon={<ChefHat />}
          color="text-orange-400"
          items={cookingItems}
          btnLabel={`✅ ${dict.kitchen.finishCook}`}
          btnColor="bg-orange-600 hover:bg-orange-700"
          onAction={handleUpdateStatus}
          nextStatus={ORDER_STATUS.READY}
        />

        <KanbanColumn
          title={dict.kitchen.ready}
          icon={<BellRing />}
          color="text-green-400"
          items={readyItems}
          btnLabel={`🚀 ${dict.kitchen.served}`}
          btnColor="bg-green-600 hover:bg-green-700 shadow-green-900/20"
          onAction={handleUpdateStatus}
          nextStatus={ORDER_STATUS.SERVED}
        />
      </div>
    </main>
  );
}