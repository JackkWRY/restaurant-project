/**
 * @file Staff Dashboard Component
 * @description Main dashboard for restaurant staff to manage tables, orders, and bills
 * 
 * This component has been refactored to use:
 * - Custom hooks (useStaffSocket, useStaffData) for logic separation
 * - Sub-components (TableCard, OrderDetailModal, BillCheckoutModal, TableManagementSection) for better organization
 * 
 * Features:
 * - Real-time table status monitoring via Socket.IO
 * - Order management (view, update status, cancel)
 * - Table CRUD operations (create, update, delete, toggle availability)
 * - Bill checkout and payment processing
 * - Audio notifications for new orders and staff calls
 * 
 * @module components/staff/StaffDashboard
 * @requires react
 * @requires next/navigation
 * @requires next/link
 * @requires sonner
 * @requires lucide-react
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Pencil, LogOut, LayoutDashboard, Globe } from "lucide-react";
import { tableService } from "@/services/tableService";
import { orderService } from "@/services/orderService";
import { ROLE } from "@/config/enums";
import { logger } from "@/lib/logger";
import type { Dictionary } from "@/locales/dictionary";

// Custom Hooks
import { useAuth } from "@/hooks";
import { useStaffSocket } from "@/hooks/useStaffSocket";
import { useStaffData } from "@/hooks/useStaffData";

// Sub-components
import TableCard from "./TableCard";
import OrderDetailModal from "./OrderDetailModal";
import BillCheckoutModal from "./BillCheckoutModal";
import TableManagementSection from "./TableManagementSection";
import { getErrorMessage, getSuccessMessage } from '@/lib/errorHandler';

interface StaffDashboardProps {
  dict: Dictionary;
  lang: string;
}

/**
 * Staff Dashboard Component
 * 
 * Main dashboard for restaurant staff to manage tables and orders.
 * Refactored to use custom hooks and sub-components for better maintainability.
 * 
 * @param dict - Localized dictionary for translations
 * @param lang - Current language (th/en)
 */
export default function StaffDashboard({ dict, lang }: StaffDashboardProps) {
  const { user, logout } = useAuth(lang);
  const toggleLang = lang === "en" ? "th" : "en";

  // Local UI State
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [activeModal, setActiveModal] = useState<"details" | "receipt" | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  // Custom Hooks
  const {
    tables,
    isLoadingTables,
    tableDetails,
    isLoadingDetails,
    mutateTables,
    mutateDetails,
  } = useStaffData(selectedTableId);

  const { newOrderAlerts, newOrderIds, clearAlert, clearNewOrderBadges } =
    useStaffSocket(mutateTables, mutateDetails);

  // Handler: Logout
  const handleLogout = async () => {
    if (confirm(dict.common.logoutConfirm)) {
      await logout();
      toast.success(dict.common.logout + " " + dict.common.success);
    }
  };

  // Handler: View Details
  const handleViewDetails = (id: number) => {
    clearAlert(id);
    setSelectedTableId(id);
    setActiveModal("details");
  };

  // Handler: Check Bill
  const handleCheckBill = (id: number) => {
    setSelectedTableId(id);
    setActiveModal("receipt");
  };

  // Handler: Close Modal
  const closeModal = () => {
    // Clear "NEW" badges when user views the details
    if (activeModal === "details" && tableDetails.length > 0) {
      const viewedOrderIds = tableDetails.map((item) => item.orderId);
      clearNewOrderBadges(viewedOrderIds);
    }
    setSelectedTableId(null);
    setActiveModal(null);
  };

  // Handler: Confirm Payment
  const handleConfirmPayment = async () => {
    if (!selectedTableId) return;
    const tableName = tables.find((t) => t.id === selectedTableId)?.name || "";
    if (!confirm(`${dict.common.confirm} ${tableName}?`)) return;

    try {
      const data = await tableService.closeTable(selectedTableId);

      if (data.status === "success") {
        toast.success(`💰 ${dict.common.success}!`);
        clearAlert(selectedTableId);
        mutateTables();
        closeModal();
      } else {
        const message = getErrorMessage(data, dict);
        toast.error(message);
      }
    } catch (error) {
      logger.error(error);
      const message = getErrorMessage(error, dict);
      toast.error(message);
    }
  };

  // Handler: Toggle Table Availability
  const handleToggleTable = async (
    tableId: number,
    currentStatus: boolean,
    isOccupied: boolean
  ) => {
    if (currentStatus === true && isOccupied) {
      toast.error(dict.staff.alertCannotClose);
      return;
    }
    try {
      await tableService.toggleAvailability(tableId, !currentStatus);
      mutateTables();
      toast.success(dict.common.success);
    } catch (error) {
      const message = getErrorMessage(error, dict);
      toast.error(message);
      logger.error(error);
    }
  };

  // Handler: Create Table
  const handleCreateTable = async (name: string) => {
    try {
      const data = await tableService.createTable(name);
      if (data.status === "success") {
        mutateTables();
        const message = getSuccessMessage(data, dict);
        toast.success(message);
      }
    } catch (error) {
      const message = getErrorMessage(error, dict);
      toast.error(message);
      logger.error(error);
    }
  };

  // Handler: Delete Table
  const handleDeleteTable = async (id: number) => {
    if (!confirm(dict.staff.alertConfirmDelete)) return;
    try {
      const response = await tableService.deleteTable(id);
      
      // Check if deletion was successful
      if (response.status === 'success') {
        mutateTables();
        toast.success(dict.common.success);
      } else {
        // Show error message from backend
        toast.error(response.message || dict.common.error);
      }
    } catch (error: unknown) {
      logger.error(error);
      
      // Type guard for error with response
      const isErrorWithResponse = (err: unknown): err is { response: { data: { message?: string } } } => {
        return (
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          typeof (err as Record<string, unknown>).response === 'object' &&
          (err as Record<string, unknown>).response !== null
        );
      };
      
      // Show specific error message if available
      const errorMessage = isErrorWithResponse(error)
        ? error.response.data.message || dict.common.error
        : dict.common.error;
      toast.error(errorMessage);
    }
  };

  // Handler: Update Table Name
  const handleUpdateTableName = async (id: number, oldName: string) => {
    const newName = prompt(dict.staff.promptEditTable, oldName);
    if (!newName || newName === oldName) return;
    try {
      await tableService.updateTable(id, newName);
      mutateTables();
      toast.success(dict.common.success);
    } catch (error) {
      logger.error(error);
    }
  };

  // Handler: Acknowledge Staff Call
  const handleAcknowledgeCall = async (tableId: number) => {
    try {
      await tableService.callStaff(tableId, false);
      mutateTables();
      const message = getSuccessMessage({ code: 'SUCCESS_TABLE_004' }, dict);
      toast.success(message);
    } catch (error) {
      logger.error(error);
    }
  };

  // Handler: Change Order Status
  const handleChangeStatus = async (
    itemId: number,
    newStatus: string,
    menuName: string
  ) => {
    if (newStatus === "CANCELLED") {
      if (!confirm(`${dict.common.confirm} ${dict.staff.order} "${menuName}" ?`))
        return;
    }

    try {
      const data = await orderService.updateItemStatus(itemId, newStatus);
      if (data.status === "success") {
        mutateDetails();
        if (newStatus !== "CANCELLED") {
          mutateTables();
        }
        toast.success(dict.common.success);
      } else {
        toast.error(dict.common.error);
      }
    } catch (error) {
      logger.error(error);
      toast.error(dict.common.error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {dict.staff.title} 🏪
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isEditingMode
              ? `🔧 ${dict.staff.editMode}`
              : `👋 ${dict.staff.subtitle}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Admin Dashboard Link */}
          {user?.role === ROLE.ADMIN && (
            <Link
              href={`/${lang}/admin`}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors"
            >
              <LayoutDashboard size={18} />{" "}
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          )}

          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditingMode(!isEditingMode)}
            className={`px-4 py-1.5 rounded-lg font-bold flex items-center gap-2 text-sm border transition-all ${
              isEditingMode
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {isEditingMode ? (
              <>
                <Check size={16} /> {dict.staff.finishEdit}
              </>
            ) : (
              <>
                <Pencil size={16} /> {dict.staff.editMode}
              </>
            )}
          </button>

          {/* Language Toggle */}
          <Link
            href={`/${toggleLang}/staff`}
            className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 transition-all"
          >
            <Globe size={14} /> {lang.toUpperCase()}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />{" "}
            <span className="hidden md:inline">{dict.common.logout}</span>
          </button>
        </div>
      </header>

      {/* Table Management Section (Edit Mode) */}
      <TableManagementSection
        isVisible={isEditingMode}
        onCreateTable={handleCreateTable}
        dict={dict}
      />

      {/* Tables Grid */}
      {isLoadingTables && tables.length === 0 ? (
        <p className="text-center text-slate-500 py-10">{dict.common.loading}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              isEditingMode={isEditingMode}
              hasNewOrder={newOrderAlerts.includes(table.id)}
              onViewDetails={handleViewDetails}
              onCheckBill={handleCheckBill}
              onToggle={handleToggleTable}
              onAcknowledgeCall={handleAcknowledgeCall}
              onDelete={handleDeleteTable}
              onUpdateName={handleUpdateTableName}
              dict={dict}
              lang={lang}
            />
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={activeModal === "details"}
        tableId={selectedTableId}
        tableName={tables.find((t) => t.id === selectedTableId)?.name || ""}
        tableDetails={tableDetails}
        isLoading={isLoadingDetails}
        newOrderIds={newOrderIds}
        onClose={closeModal}
        onStatusChange={handleChangeStatus}
        dict={dict}
      />

      {/* Bill Checkout Modal */}
      <BillCheckoutModal
        isOpen={activeModal === "receipt"}
        tableId={selectedTableId}
        tableName={tables.find((t) => t.id === selectedTableId)?.name || ""}
        tableDetails={tableDetails}
        isLoading={isLoadingDetails}
        onClose={closeModal}
        onConfirmPayment={handleConfirmPayment}
        dict={dict}
      />
    </main>
  );
}