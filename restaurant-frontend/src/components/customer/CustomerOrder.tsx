"use client";

import { API_URL, fetcher } from "@/lib/utils";
import { ORDER_STATUS } from "@/config/enums";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client"; 
import useSWR from "swr";
import { toast } from "sonner";
import { QrCode, Lock, Bell, History, X, ChevronDown, ChevronUp, Globe } from "lucide-react";
import MenuItem from "@/components/customer/MenuItem"; 
import FloatingCart from "@/components/customer/FloatingCart"; 
import TableDetector from "@/components/customer/TableDetector"; 
import { useCartStore } from "@/store/useCartStore";
import type { Dictionary } from "@/locales/dictionary";
import { logger } from "@/lib/logger";

// --- Types ---
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

// --- Main Component ---
export default function CustomerOrder({ dict, lang }: CustomerOrderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableIdParam = searchParams.get("tableId");
  
  const { totalItems } = useCartStore(); 
  const [showHistory, setShowHistory] = useState(false);
  
  const { data: menuData } = useSWR(`${API_URL}/api/menus`, fetcher, { 
      refreshInterval: 60000 
  });
  const categories: Category[] = menuData?.status === 'success' ? menuData.data : [];

  const { data: tableData, mutate: mutateTable } = useSWR(
      tableIdParam ? `${API_URL}/api/tables/${tableIdParam}` : null, 
      fetcher,
      { refreshInterval: 5000 }
  );
  const tableInfo: TableInfo | null = tableData?.status === 'success' ? tableData.data : null;

  const { data: settingsData } = useSWR(`${API_URL}/api/settings/name`, fetcher);
  const restaurantName = settingsData?.status === 'success' ? settingsData.data : dict.common.loading;

  const { data: historyData, mutate: mutateHistory } = useSWR(
      showHistory && tableIdParam ? `${API_URL}/api/bills/table/${tableIdParam}` : null,
      fetcher,
      { refreshInterval: 5000 }
  );
  const historyItems: HistoryItem[] = historyData?.status === 'success' ? historyData.data.items : [];

  useEffect(() => {
    if (!tableIdParam) return;

    // Connect to public namespace (no authentication required)
    const socket = io(API_URL + '/public');
    
    socket.on("connect", () => { 
      logger.debug("Customer connected to public socket");
      // Join table-specific room for targeted updates
      socket.emit("join_table", Number(tableIdParam));
    });
    
    socket.on("table_updated", (updatedTable: TableInfo) => {
        if (String(updatedTable.id) === String(tableIdParam)) {
            mutateTable();
        }
    });

    socket.on("order_status_updated", () => {
        if (showHistory) mutateHistory();
    });

    socket.on("item_status_updated", () => {
        if (showHistory) mutateHistory();
    });

    return () => { 
      // Leave table room before disconnecting
      socket.emit("leave_table", Number(tableIdParam));
      socket.disconnect(); 
    };
  }, [tableIdParam, showHistory, mutateTable, mutateHistory]);

  // --- Handlers ---

  const handleSwitchLang = () => {
    const newLang = lang === 'en' ? 'th' : 'en';
    const currentQuery = searchParams.toString(); 
    router.push(`/${newLang}/order?${currentQuery}`);
  };

  const handleCallStaff = async () => {
    if (!tableIdParam || !tableInfo) return;
    
    const newStatus = !tableInfo.isCallingStaff;
    
    mutateTable({
        ...tableData,
        data: { ...tableInfo, isCallingStaff: newStatus }
    }, false);

    try {
        await fetch(`${API_URL}/api/tables/${tableIdParam}/call`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCalling: newStatus })
        });
        
        if (newStatus) toast.success(dict.customer.alertCallStaff);
        else toast.info(dict.customer.alertCancelCall);
        
        mutateTable();
    } catch (error) {
        logger.error(error);
        toast.error(dict.customer.alertFailed);
        mutateTable();
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
        case ORDER_STATUS.PENDING: return { label: `🕒 ${dict.kitchen.pending}`, color: 'text-yellow-600' };
        case ORDER_STATUS.COOKING: return { label: `🍳 ${dict.kitchen.cooking}`, color: 'text-orange-600' };
        case ORDER_STATUS.READY: return { label: `✨ ${dict.kitchen.ready}`, color: 'text-green-600 animate-pulse font-bold' };
        case ORDER_STATUS.SERVED: return { label: `✅ ${dict.kitchen.served}`, color: 'text-green-700 font-bold' };
        case ORDER_STATUS.COMPLETED: return { label: `💰 ${dict.customer.statusCompleted}`, color: 'text-slate-500' };
        case ORDER_STATUS.CANCELLED: return { label: `❌ ${dict.staff.statusCancelled}`, color: 'text-red-500 font-bold' };
        default: return { label: status, color: 'text-slate-500' };
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{dict.customer.scanQr}</h1>
          <p className="text-slate-500 mb-6">{dict.customer.scanQrDesc}</p>
        </div>
      </div>
    );
  }

  if (!tableData && !menuData) {
      return <div className="min-h-screen flex justify-center items-center bg-white">{dict.common.loading}</div>;
  }

  if (tableInfo && !tableInfo.isAvailable) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full border-t-4 border-red-500">
                <div className="bg-red-50 p-4 rounded-full mb-6">
                    <Lock size={64} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{dict.customer.tableClosed}</h1>
                <p className="text-slate-500 mb-6">{dict.customer.contactStaff}</p>
            </div>
        </div>
      );
  }

  return (
    <main className="container mx-auto p-4 max-w-md min-h-screen bg-white pb-24 relative">
      <TableDetector />

      <header className="mb-6 mt-4 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-3 border-b">
        <div>
            <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{restaurantName}</h1>
            <p className="text-slate-500 text-xs">
            {dict.customer.table}: <span className="font-bold text-green-600">{tableInfo?.name || tableIdParam}</span>
            </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
            <button 
                onClick={handleSwitchLang}
                className="p-2 rounded-full bg-white text-slate-600 shadow-sm border border-slate-200 flex items-center gap-1 text-xs font-bold px-3 hover:bg-slate-50"
            >
                <Globe size={16} /> {lang.toUpperCase()}
            </button>

            <button 
                onClick={handleCallStaff}
                className={`p-2 rounded-full shadow-sm border transition-all ${
                    tableInfo?.isCallingStaff ? "bg-red-100 text-red-600 border-red-200 animate-pulse" : "bg-white text-slate-600 border-slate-200"
                }`}
            >
                <Bell size={20} className={tableInfo?.isCallingStaff ? "fill-current" : ""} />
            </button>
            <button 
                onClick={() => setShowHistory(true)}
                className="p-2 rounded-full bg-white text-slate-600 shadow-sm border border-slate-200 relative"
            >
                <History size={20} />
            </button>
        </div>
      </header>
      
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

      {totalItems() > 0 && <FloatingCart dict={dict} />}

      {/* Modal History */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><History size={18}/> {dict.customer.orderHistory}</h3>
                    <button onClick={() => setShowHistory(false)}><X size={24}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                    {historyItems.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">{dict.customer.noHistory}</p>
                    ) : (
                        <div className="space-y-3">
                            {historyItems.map((item, idx) => {
                                const { label, color } = getStatusDisplay(item.status);
                                const isCancelled = item.status === ORDER_STATUS.CANCELLED;
                                return (
                                    <div key={idx} className={`flex justify-between items-start border-b pb-3 last:border-0 ${isCancelled ? 'bg-slate-50 opacity-60' : ''}`}>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-bold text-lg leading-tight break-words ${isCancelled ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                                {item.menuName}
                                            </div>
                                            
                                            {item.note && (
                                                <div className="text-xs text-red-500 italic mt-0.5 break-words">
                                                    *{item.note}
                                                </div>
                                            )}

                                            <div className={`text-xs mt-1 ${color}`}>
                                                {label}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 pl-2">
                                            <div className="text-sm text-slate-500">x{item.quantity}</div>
                                            <div className={`font-bold ${isCancelled ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                                {dict.common.currency}{item.total}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t">
                     <div className="flex justify-between text-lg font-bold text-slate-900">
                        <span>{dict.staff.total}</span>
                        <span>
                            {dict.common.currency}{historyItems
                                .filter(i => i.status !== ORDER_STATUS.CANCELLED)
                                .reduce((sum, i) => sum + i.total, 0)
                                .toLocaleString()}
                        </span>
                     </div>
                </div>
            </div>
        </div>
      )}
    </main>
  );
}

function CategoryAccordion({ category, dict }: { category: Category, dict: Dictionary }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center p-4 text-left transition-colors ${isOpen ? "bg-slate-50 text-slate-900" : "bg-white text-slate-700 hover:bg-slate-50"}`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{category.name}</span>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        {category.menus.length}
                    </span>
                </div>
                {isOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>

            {isOpen && (
                <div className="p-4 bg-white border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="grid gap-4">
                        {category.menus.map((menu) => (
                            <MenuItem 
                                key={menu.id}
                                id={menu.id}
                                nameTH={menu.nameTH}
                                price={menu.price}
                                imageUrl={menu.imageUrl}
                                isRecommended={menu.isRecommended}
                                isAvailable={menu.isAvailable}
                                dict={dict}
                            />
                        ))}
                        {category.menus.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-4">{dict.customer.noMenuInCategory}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}