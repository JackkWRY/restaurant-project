"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
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
import { API_URL } from "@/lib/utils";

// Lazy load components
const AnalyticsDashboard = dynamic(() => import("./AnalyticsDashboard"), {
  loading: () => (
    <div className="h-[400px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed animate-pulse">
      Loading Charts...
    </div>
  ),
  ssr: false,
});

const HistoryDashboard = dynamic(() => import("./HistoryDashboard"), {
  ssr: false,
});

// Import extracted admin components
const SettingsManager = dynamic(() => import("./admin/SettingsManager"), {
  ssr: false,
});

const CategoryManager = dynamic(() => import("./admin/CategoryManager"), {
  ssr: false,
});

const MenuManager = dynamic(() => import("./admin/MenuManager"), {
  ssr: false,
});

interface AdminDashboardProps {
  dict: Dictionary;
  lang: string;
}

/**
 * AdminDashboard Component
 * Main dashboard for admin users with tab navigation
 * Refactored to use separate components for better maintainability
 */
export default function AdminDashboard({ dict, lang }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "analytics" | "history" | "categories" | "menus" | "settings"
  >("analytics");
  const toggleLang = lang === "en" ? "th" : "en";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/${lang}/login`);
    }
  }, [router, lang]);

  const handleLogout = async () => {
    if (confirm(dict.common.logoutConfirm)) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          await fetch(`${API_URL}/api/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push(`/${lang}/login`);
      }
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