"use client";

import { API_URL, fetcher } from "@/lib/utils";
import { APP_CONFIG } from "@/config/constants";
import { ORDER_STATUS, ROLE } from "@/config/enums";
import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link"; 
import { useRouter } from "next/navigation"; 
import { io, type Socket } from "socket.io-client"; 
import useSWR from "swr"; 
import { toast } from "sonner"; 
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Pencil, Trash2, Plus, X, Check, Eye, UtensilsCrossed, Bell, Ban, ShoppingBag, Sparkles, Receipt, Coins, LogOut, LayoutDashboard, Globe, ChefHat } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";

// --- Types ---
interface TableStatus {
  id: number;
  name: string;
  isOccupied: boolean;
  totalAmount: number;
  activeOrders: number;
  isAvailable: boolean;
  isCallingStaff: boolean; 
  readyOrderCount: number;
}

interface OrderDetailItem {
  id: number;
  orderId: number;
  menuName: string;
  price: number;
  quantity: number;
  total: number;
  status: string;
  note?: string;
}

interface NewOrderPayload {
  id: number;
  tableId: number;
}

interface StaffDashboardProps {
  dict: Dictionary;
  lang: string;
}

export default function StaffDashboard({ dict, lang }: StaffDashboardProps) {
  const router = useRouter();
  
  // Local State
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeModal, setActiveModal] = useState<'details' | 'receipt' | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [newOrderAlerts, setNewOrderAlerts] = useState<number[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<number[]>([]);
  const [userRole, setUserRole] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const toggleLang = lang === 'en' ? 'th' : 'en';

  // --- 1. Main SWR: Fetch All Tables ---
  const { data: tablesData, mutate: mutateTables, isLoading: loadingTables } = useSWR(`${API_URL}/api/tables/status`, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const tables: TableStatus[] = useMemo(() => {
    return (tablesData?.status === 'success') ? tablesData.data : [];
  }, [tablesData]);

  // --- 2. Details SWR: Fetch Specific Table Details ---
  const { data: detailsData, mutate: mutateDetails, isLoading: loadingDetails } = useSWR(
    selectedTableId ? `${API_URL}/api/tables/${selectedTableId}/details` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const tableDetails: OrderDetailItem[] = useMemo(() => {
    return (detailsData?.status === 'success') ? detailsData.data.items : [];
  }, [detailsData]);

  // --- 3. Auth Logic ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      router.push(`/${lang}/login`); 
    } else if (userStr) {
        try {
            const user = JSON.parse(userStr);
            setUserRole(user.role);
        } catch (e) {
            console.error("Error parsing user", e);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    if (confirm(dict.common.logoutConfirm)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(`/${lang}/login`);
      toast.success(dict.common.logout + " " + dict.common.success);
    }
  };

  // --- 4. Socket Integration ---
  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    if (!socketRef.current) {
        socketRef.current = io(API_URL);
        
        socketRef.current.on("new_order", (newOrder: NewOrderPayload) => {
            mutateTables(); 
            setNewOrderAlerts((prev) => {
                if (prev.includes(newOrder.tableId)) return prev;
                return [...prev, newOrder.tableId];
            });
            setNewOrderIds((prev) => [...prev, newOrder.id]); 

            try {
                const audio = new Audio(APP_CONFIG.SOUNDS.NOTIFICATION); 
                audio.play().catch((err) => console.log("Audio play blocked:", err));
            } catch (error) {
                console.error("Error playing sound:", error);
            }
        });

        socketRef.current.on("table_updated", (updatedTable: TableStatus) => {
            mutateTables();

            if (updatedTable && updatedTable.isCallingStaff) {
                try {
                    const audio = new Audio(APP_CONFIG.SOUNDS.BELL_1);
                    audio.play().catch((err) => console.log("Audio play blocked (User must interact first):", err));
                } catch (error) {
                    console.error("Error playing sound:", error);
                }
            }
        });

        socketRef.current.on("order_status_updated", () => {
            mutateTables();
            mutateDetails(); 
        });

        socketRef.current.on("item_status_updated", (item: { status: string }) => {
            mutateTables();
            mutateDetails();
            if (item && item.status === 'READY') {
                try {
                    const audio = new Audio(APP_CONFIG.SOUNDS.BELL_2); 
                    audio.play().catch((err) => console.log("Audio play blocked:", err));
                } catch (error) {
                    console.error("Error playing sound:", error);
                }
            }
        });
    }

    return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };
  }, [mutateTables, mutateDetails]); 

  // --- Handlers ---

  const handleAcknowledgeCall = async (tableId: number) => {
    try {
        await fetch(`${API_URL}/api/tables/${tableId}/call`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCalling: false })
        });
        mutateTables(); 
        toast.success(dict.staff.callCustomer + " - " + dict.common.success);
    } catch (error) { console.error(error); }
  };

  const handleViewDetails = (id: number) => {
    setNewOrderAlerts((prev) => prev.filter((tableId) => tableId !== id)); 
    setSelectedTableId(id);
    setActiveModal('details');
  };

  const handleCheckBill = (id: number) => {
    setSelectedTableId(id);
    setActiveModal('receipt');
  };

  const closeModal = () => { 
      if (activeModal === 'details' && tableDetails.length > 0) {
          const viewedOrderIds = tableDetails.map(item => item.orderId);
          setNewOrderIds(prev => prev.filter(id => !viewedOrderIds.includes(id)));
      }
      setSelectedTableId(null); 
      setActiveModal(null);
  };

  const handleConfirmPayment = async () => {
    if (!selectedTableId) return;
    const tableName = tables.find(t => t.id === selectedTableId)?.name || "";
    if (!confirm(`${dict.common.confirm} ${tableName}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/tables/${selectedTableId}/close`, { 
        method: 'POST' 
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`💰 ${dict.common.success}!`); 
        setNewOrderAlerts((prev) => prev.filter((tid) => tid !== selectedTableId));
        mutateTables(); 
        closeModal(); 
      } else {
        toast.error(`${dict.common.error}: ${data.error}`);
      }
    } catch (error) { console.error(error); toast.error(dict.common.error); }
  };

  const handleToggleTable = async (tableId: number, currentStatus: boolean, isOccupied: boolean) => {
    if (currentStatus === true && isOccupied) { 
        toast.error(dict.staff.alertCannotClose);
        return; 
    }
    try {
      await fetch(`${API_URL}/api/tables/${tableId}/availability`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      mutateTables();
      toast.success(dict.common.success);
    } catch (error) { console.error(error); }
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/tables`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTableName })
      });
      if (res.ok) { 
          setNewTableName(""); 
          setIsCreating(false); 
          mutateTables();
          toast.success(dict.staff.addTable + " " + dict.common.success);
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm(dict.staff.alertConfirmDelete)) return;
    try {
      await fetch(`${API_URL}/api/tables/${id}`, { method: 'DELETE' });
      mutateTables();
      toast.success(dict.common.success);
    } catch (error) { console.error(error); }
  };

  const handleUpdateTableName = async (id: number, oldName: string) => {
    const newName = prompt(dict.staff.promptEditTable, oldName);
    if (!newName || newName === oldName) return;
    try {
      await fetch(`${API_URL}/api/tables/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) });
      mutateTables();
      toast.success(dict.common.success);
    } catch (error) { console.error(error); }
  };

  const handleCancelOrder = async (itemId: number, menuName: string) => {
    if(!confirm(`${dict.common.confirm} ${dict.staff.order} "${menuName}" ?`)) return;
    try {
        const res = await fetch(`${API_URL}/api/orders/items/${itemId}/status`, { 
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED' })
        });
        if (res.ok) { 
            mutateDetails(); 
            mutateTables(); 
            toast.success(dict.common.success);
        }
    } catch (error) { console.error(error); toast.error(dict.common.error); }
  };

  const handleChangeStatus = async (itemId: number, newStatus: string, menuName: string) => {
      if (newStatus === ORDER_STATUS.CANCELLED) {
          handleCancelOrder(itemId, menuName);
          return;
      }
      try {
          const res = await fetch(`${API_URL}/api/orders/items/${itemId}/status`, {
              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
              mutateDetails();
              toast.success(dict.common.success);
          }
          else toast.error(dict.common.error);
      } catch (error) { console.error(error); toast.error(dict.common.error); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case ORDER_STATUS.PENDING: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case ORDER_STATUS.COOKING: return 'text-orange-600 bg-orange-50 border-orange-200';
        case ORDER_STATUS.READY: return 'text-green-600 bg-green-50 border-green-200 font-bold';
        case ORDER_STATUS.SERVED: return 'text-blue-700 bg-blue-50 border-blue-200 font-bold';
        case ORDER_STATUS.COMPLETED: return 'text-slate-500 bg-slate-50 border-slate-200';
        case ORDER_STATUS.CANCELLED: return 'text-red-500 bg-red-50 border-red-200 line-through';
        default: return 'text-slate-500';
    }
  };

  // Calculations for Receipt/Details
  const validItems = useMemo(() => tableDetails.filter(i => i.status !== ORDER_STATUS.CANCELLED), [tableDetails]);
  const totalAmount = useMemo(() => validItems.reduce((sum, i) => sum + i.total, 0), [validItems]);
  const unservedCount = useMemo(() => validItems.filter(i => 
    ![ORDER_STATUS.SERVED, ORDER_STATUS.COMPLETED].includes(i.status as ORDER_STATUS)
  ).length, [validItems]);

  return (
    <main className="min-h-screen bg-slate-100 p-6 relative">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm flex-wrap gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">{dict.staff.title} 🏪</h1>
            <p className="text-slate-500 text-sm mt-1">{isEditingMode ? `🔧 ${dict.staff.editMode}` : `👋 ${dict.staff.subtitle}`}</p>
        </div>
        
        <div className="flex items-center gap-4"> 
            
             {userRole === ROLE.ADMIN && (
                <Link href={`/${lang}/admin`} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
                    <LayoutDashboard size={18} /> <span className="hidden md:inline">Dashboard</span>
                </Link>
             )}

            <button onClick={() => setIsEditingMode(!isEditingMode)} className={`px-4 py-1.5 rounded-lg font-bold flex items-center gap-2 text-sm border transition-all ${isEditingMode ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {isEditingMode ? <><Check size={16} /> {dict.staff.finishEdit}</> : <><Pencil size={16} /> {dict.staff.editMode}</>}
            </button>
            
            <Link 
                href={`/${toggleLang}/staff`}
                className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 transition-all"
            >
                <Globe size={14} /> {lang.toUpperCase()}
            </Link>

             <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <LogOut size={16} /> <span className="hidden md:inline">{dict.common.logout}</span>
             </button>
        </div>
      </header>

      {isEditingMode && (
         <div className="mb-6">
            {!isCreating ? (
                <button onClick={() => setIsCreating(true)} className="w-full bg-slate-200 border-2 border-dashed border-slate-400 text-slate-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300"><Plus size={24} /> {dict.staff.addTable}</button>
            ) : (
                <div className="bg-white p-4 rounded-xl shadow-sm flex gap-2 items-center animate-in fade-in zoom-in">
                    <input type="text" placeholder={dict.staff.placeholderTable} className="border p-2 rounded-lg flex-1" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} autoFocus />
                    <button onClick={handleCreateTable} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">{dict.common.save}</button>
                    <button onClick={() => setIsCreating(false)} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><X size={18} /> {dict.common.cancel}</button>
                </div>
            )}
         </div>
      )}

      {loadingTables && tables.length === 0 ? <p className="text-center text-slate-500 py-10">{dict.common.loading}</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((table) => {
              const hasNewOrder = newOrderAlerts.includes(table.id);
              return (
                <Card 
                  key={table.id} 
                  className={`border-2 transition-all relative overflow-hidden ${
                      table.isCallingStaff ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                      : hasNewOrder ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                      : !table.isAvailable ? "border-slate-200 bg-slate-100 opacity-70" 
                      : table.isOccupied && !isEditingMode ? "border-orange-400 bg-orange-50/50" : "border-slate-200 bg-white"
                  }`}
                >
                  {!table.isAvailable && !isEditingMode && <div className="absolute top-0 left-0 right-0 bg-slate-500 text-white text-xs text-center py-1 z-10">⛔ {dict.staff.closed}</div>}
                  
                  {table.isCallingStaff ? (
                      <div onClick={() => handleAcknowledgeCall(table.id)} className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold text-center py-1 z-20 cursor-pointer hover:bg-red-700 flex justify-center items-center gap-1 animate-pulse">
                          <Bell size={12} className="fill-current" /> {dict.staff.callCustomer}
                      </div>
                  ) : hasNewOrder ? ( 
                      <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-xs font-bold text-center py-1 z-20 flex justify-center items-center gap-1 animate-pulse">
                          <ShoppingBag size={12} className="fill-current" /> {dict.staff.newOrder}
                      </div>
                  ) : table.readyOrderCount > 0 ? (
                      <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-xs font-bold text-center py-1 z-20 flex justify-center items-center gap-1 animate-bounce">
                          <ChefHat size={12} /> {dict.staff.ready} ({table.readyOrderCount})
                      </div>
                  ) : null}

                  <CardHeader className="pb-2 mt-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className={`text-2xl font-bold ${!table.isAvailable ? 'text-slate-400' : 'text-slate-800'}`}>{table.name}</CardTitle>
                      
                      {!isEditingMode ? (
                        <div className="flex items-center gap-2">
                           <button onClick={() => handleToggleTable(table.id, table.isAvailable, table.isOccupied)} className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${table.isAvailable ? (table.isOccupied ? 'bg-green-500/50 cursor-not-allowed' : 'bg-green-500') : 'bg-slate-300'}`}>
                               <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${table.isAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
                           </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                            <button onClick={() => handleUpdateTableName(table.id, table.name)} className="p-1 bg-slate-100 rounded text-blue-600"><Pencil size={16} /></button>
                            <button onClick={() => handleDeleteTable(table.id)} className="p-1 bg-slate-100 rounded text-red-600"><Trash2 size={16} /></button>
                        </div>
                      )}

                    </div>
                  </CardHeader>
                  <CardContent>
                    {!isEditingMode ? (
                      <div className="flex flex-col space-y-1">
                          <span className="text-slate-500 text-sm">{dict.staff.total}</span>
                          <span className={`text-3xl font-bold ${table.isAvailable ? (table.isOccupied ? "text-slate-900" : "text-slate-300") : "text-slate-300"}`}>
                              {dict.common.currency}{table.totalAmount.toLocaleString()}
                          </span>
                          <button onClick={() => handleViewDetails(table.id)} disabled={!table.isAvailable} className="text-xs text-blue-600 underline mt-1 flex items-center gap-1 hover:text-blue-800 disabled:text-slate-400 disabled:no-underline">
                            <Eye size={12} /> {dict.staff.viewDetails} ({table.activeOrders})
                          </button>
                      </div>
                    ) : <div className="text-center text-slate-400 py-4 text-sm">ID: {table.id}<br/>(Mode: Edit)</div>}
                  </CardContent>
                  {!isEditingMode && (
                      <CardFooter className="flex gap-2">
                        <Link href={`/${lang}/order?tableId=${table.id}`} target="_blank" className={`flex-1 py-2 rounded-lg font-bold text-center text-sm flex items-center justify-center gap-1 transition-colors ${table.isAvailable ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-slate-200 text-slate-400 pointer-events-none"}`}>
                            <UtensilsCrossed size={16} /> {dict.staff.order}
                        </Link>
                        <button onClick={() => handleCheckBill(table.id)} disabled={!table.isAvailable || !table.isOccupied} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${table.isAvailable && table.isOccupied ? "bg-slate-900 text-white hover:bg-slate-700 shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
                            💰 {dict.staff.checkBill}
                        </button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
        </div>
      )}

      {/* Modal 1: Details */}
      {selectedTableId !== null && activeModal === 'details' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2"><UtensilsCrossed size={20} /> {dict.menu.foods} : {tables.find(t => t.id === selectedTableId)?.name}</h2>
              <button onClick={closeModal} className="text-slate-300 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {loadingDetails ? <p className="text-center text-slate-500 py-10">{dict.common.loading}</p> : tableDetails.length === 0 ? <div className="text-center py-10 text-slate-500">{dict.staff.noOrders}</div> : (
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 text-sm">
                      <tr>
                          <th className="p-2 rounded-l">{dict.admin.name}</th>
                          <th className="p-2 text-center">{dict.admin.status}</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right rounded-r">{dict.staff.total}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tableDetails.map((item, idx) => {
                      const isCancelled = item.status === ORDER_STATUS.CANCELLED;
                      const isNewItem = newOrderIds.includes(item.orderId);
                      const statusColor = getStatusColor(item.status);
                      return (
                        <tr key={`${item.id}-${idx}`} className={`${isCancelled ? "bg-slate-50 opacity-60" : isNewItem ? "bg-blue-50" : ""}`}>
                            <td className="p-2 max-w-[150px]">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <span className={`font-medium block truncate ${isCancelled ? "line-through text-slate-500" : "text-slate-800"}`}>
                                            {item.menuName}
                                        </span>
                                        {item.note && <div className="text-xs text-red-500 italic break-words mt-0.5">*{item.note}</div>}
                                    </div>
                                    {isNewItem && !isCancelled && <span className="shrink-0 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 animate-pulse"><Sparkles size={10} /> {dict.staff.new}</span>}
                                </div>
                            </td>
                            <td className="p-2 text-center">
                                {!isCancelled ? (
                                    <select 
                                        value={item.status} 
                                        onChange={(e) => handleChangeStatus(item.id, e.target.value, item.menuName)} 
                                        className={`text-xs border rounded p-1 font-bold outline-none cursor-pointer ${statusColor}`}
                                    >
                                        <option value={ORDER_STATUS.PENDING}>🕒 {dict.kitchen.pending}</option>
                                        <option value={ORDER_STATUS.COOKING}>🍳 {dict.kitchen.cooking}</option>
                                        <option value={ORDER_STATUS.READY}>✨ {dict.kitchen.ready}</option>
                                        <option value={ORDER_STATUS.SERVED}>✅ {dict.kitchen.served}</option>
                                        <option value={ORDER_STATUS.CANCELLED}>❌ {dict.common.cancel}</option>
                                    </select>
                                ) : <span className="text-xs text-red-500 font-bold border border-red-200 bg-red-50 px-2 py-1 rounded">{dict.staff.statusCancelled}</span>}
                            </td>
                            <td className="p-2 text-center text-slate-600">x{item.quantity}</td>
                            <td className="p-2 text-right font-bold text-slate-900">{isCancelled ? <span className="line-through text-slate-400">{dict.common.currency}{item.total}</span> : `${dict.common.currency}${item.total}`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t">
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-600">{dict.staff.total}</span>
                    <span className="text-2xl font-bold text-slate-900">{dict.common.currency}{totalAmount.toLocaleString()}</span>
                 </div>
                <button onClick={closeModal} className="w-full bg-slate-200 text-slate-600 py-3 rounded-lg font-bold">{dict.common.back}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Receipt */}
      {selectedTableId !== null && activeModal === 'receipt' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white text-center relative">
               <Receipt className="mx-auto mb-2 opacity-80" size={40} />
               <h2 className="text-2xl font-bold">{dict.staff.receipt}</h2>
               <p className="text-slate-400">Table: {tables.find(t => t.id === selectedTableId)?.name}</p>
               <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[60vh]">
               {loadingDetails ? <p className="text-center text-slate-500">{dict.common.loading}</p> : (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        {tableDetails.map((item, idx) => {
                           const isCancelled = item.status === ORDER_STATUS.CANCELLED;
                           return (
                             <div key={idx} className={`flex justify-between text-sm border-b border-dashed border-slate-200 pb-2 ${isCancelled ? 'bg-slate-50' : ''}`}>
                                <div className="flex-1">
                                    <span className={`font-medium block ${isCancelled ? 'text-red-500 line-through' : 'text-slate-800'}`}>
                                        {item.menuName}
                                    </span>
                                    
                                    {item.note && (
                                        <div className="text-xs text-slate-500 italic flex items-center gap-1">
                                            📝 {item.note}
                                        </div>
                                    )}

                                    <div className="text-xs text-slate-500 mt-0.5">
                                        x{item.quantity} @ {dict.common.currency}{item.price}
                                        {isCancelled && <span className="text-red-500 font-bold ml-2">({dict.staff.statusCancelled})</span>}
                                    </div>
                                </div>
                                
                                <span className={`font-bold ${isCancelled ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                                    {dict.common.currency}{item.total}
                                </span>
                             </div>
                           );
                        })}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-slate-600">
                            <span>{dict.staff.itemsCount} ({validItems.length})</span>
                            <span>{dict.common.currency}{totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t">
                            <span>{dict.staff.total}</span>
                            <span>{dict.common.currency}{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {unservedCount > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex gap-2 items-start">
                             <Ban size={18} className="shrink-0 mt-0.5" />
                             <div>
                                 <span className="font-bold block">{dict.staff.cannotCloseTitle}</span>
                                 {unservedCount} {dict.staff.cannotCloseDesc}
                             </div>
                        </div>
                    )}
                 </div>
               )}
            </div>

            <div className="p-4 bg-white border-t flex gap-3">
                <button onClick={closeModal} className="flex-1 py-3 rounded-lg border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50">{dict.common.cancel}</button>
                <button 
                    onClick={handleConfirmPayment} 
                    disabled={unservedCount > 0 || loadingDetails}
                    className={`flex-1 py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 ${unservedCount > 0 ? "bg-slate-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-lg"}`}
                >
                    <Coins size={20} /> {dict.staff.receiveCash}
                </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}