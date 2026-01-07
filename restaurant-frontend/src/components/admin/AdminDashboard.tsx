/**
 * @file Admin Dashboard Component
 * @description Main dashboard for restaurant administrators with tabbed navigation
 * 
 * This component handles:
 * - Tab-based navigation between admin features
 * - Lazy loading of heavy components for performance
 * - Authentication verification
 * - Logout functionality
 * - Language switching
 * 
 * Features:
 * - Analytics: Real-time statistics and charts
 * - History: Order and bill history
 * - Categories: Category management
 * - Menus: Menu item management
 * - Settings: Restaurant settings
 * 
 * State management:
 * - Local state for active tab selection
 * - localStorage for authentication tokens
 * 
 * Performance optimizations:
 * - Dynamic imports with loading states
 * - SSR disabled for client-only components
 * 
 * @module components/admin/AdminDashboard
 * @requires react
 * @requires next/navigation
 * @requires next/dynamic
 * 
 * @see {@link AnalyticsDashboard} for analytics view
 * @see {@link MenuManager} for menu management
 * @see {@link CategoryManager} for category management
 */

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { toast } from "sonner";
import {
  Globe,
  LogOut,
  BarChart3,
  History,
  List,
  Utensils,
  Settings,
} from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";

// Lazy load components for better performance
// Loading states prevent layout shift during component load
const AnalyticsDashboard = dynamic(() => import("./AnalyticsDashboard"), {
  loading: () => (
    <div className="h-[400px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed animate-pulse">
      Loading Charts...
    </div>
  ),
  ssr: false, // Client-only for chart libraries
});

const HistoryDashboard = dynamic(() => import("./HistoryDashboard"), {
  ssr: false,
});

const SettingsManager = dynamic(() => import("./SettingsManager"), {
  ssr: false,
});

const CategoryManager = dynamic(() => import("./CategoryManager"), {
  ssr: false,
});

const MenuManager = dynamic(() => import("./MenuManager"), {
  ssr: false,
});

/**
 * Props for AdminDashboard component
 * 
 * @property {Dictionary} dict - Internationalization dictionary
 * @property {string} lang - Current language code (en/th)
 * 
 * @example
 * <AdminDashboard dict={dictionary} lang="en" />
 */
interface AdminDashboardProps {
  dict: Dictionary;
  lang: string;
}

/**
 * Admin Dashboard Component
 * 
 * Main dashboard for admin users with tab navigation.
 * Provides access to all administrative functions.
 * 
 * Authentication:
 * - Checks for token on mount
 * - Redirects to login if not authenticated
 * 
 * @param props - Component props
 * @returns JSX.Element
 * 
 * @example
 * <AdminDashboard dict={dictionary} lang="en" />
 */
export default function AdminDashboard({ dict, lang }: AdminDashboardProps) {
  const { logout } = useAuth(lang);
  const [activeTab, setActiveTab] = useState<
    "analytics" | "history" | "categories" | "menus" | "settings"
  >("analytics");
  const toggleLang = lang === "en" ? "th" : "en";

  const handleLogout = async () => {
    if (confirm(dict.common.logoutConfirm)) {
      await logout();
      toast.success(dict.common.logout);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {dict.admin.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/${lang}/staff`}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              {dict.admin.toStaff}
            </Link>

            <Link
              href={`/${lang}/kitchen`}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              {dict.admin.toKitchen}
            </Link>

            <Link
              href={`/${toggleLang}/admin`}
              className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 transition-all"
            >
              <Globe size={14} /> {lang.toUpperCase()}
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} /> {dict.common.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 flex-1 flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                activeTab === "analytics"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BarChart3 size={20} /> {dict.dashboard?.title || "Overview"}
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                activeTab === "history"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <History size={20} /> {dict.history?.title || "History"}
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                activeTab === "categories"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <List size={20} /> {dict.admin.manageCategories}
            </button>

            <button
              onClick={() => setActiveTab("menus")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                activeTab === "menus"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Utensils size={20} /> {dict.admin.manageMenus}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                activeTab === "settings"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Settings size={20} /> {dict.admin.shopSettings}
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <section className="flex-1 bg-white rounded-2xl shadow-sm border p-6 min-h-[500px] overflow-hidden">
          {activeTab === "analytics" && <AnalyticsDashboard dict={dict} />}

          {activeTab === "history" && (
            <div className="-m-6 h-full">
              <HistoryDashboard dict={dict} />
            </div>
          )}

          {activeTab === "categories" && <CategoryManager dict={dict} />}
          {activeTab === "menus" && <MenuManager dict={dict} />}
          {activeTab === "settings" && <SettingsManager dict={dict} />}
        </section>
      </div>
    </main>
  );
}