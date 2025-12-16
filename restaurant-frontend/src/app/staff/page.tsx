"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link"; 
import { useRouter } from "next/navigation"; 
import { io } from "socket.io-client"; 
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Pencil, Trash2, Plus, X, Check, Eye, UtensilsCrossed, Bell, ChefHat, Ban, ShoppingBag, Sparkles, Receipt, Coins, LogOut, LayoutDashboard } from "lucide-react";
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

export default function StaffPage() {
  const router = useRouter();
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [activeModal, setActiveModal] = useState<'details' | 'receipt' | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [tableDetails, setTableDetails] = useState<OrderDetailItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [newOrderAlerts, setNewOrderAlerts] = useState<number[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<number[]>([]);

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      router.push("/login"); 
    } else if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
    }
  }, [router]);

  const handleLogout = () => {
    if (confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  const refreshDetailsIfOpen = useCallback(() => {
    if (selectedTableId) {
        fetch(`http://localhost:3000/api/staff/tables/${selectedTableId}`)
          .then(res => res.json())
          .then(data => {
              if (data.status === 'success') setTableDetails(data.data.items);
          });
    }
  }, [selectedTableId]);

  const fetchTables = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/staff/tables');
      const data = await res.json();
      if (data.status === 'success') {
        setTables(data.data);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    fetchTables();
    
    const socket = io("http://localhost:3000");
    
    socket.on("new_order", (newOrder) => {
        fetchTables(); 
        setNewOrderAlerts((prev) => {
            if (prev.includes(newOrder.tableId)) return prev;
            return [...prev, newOrder.tableId];
        });
        setNewOrderIds((prev) => [...prev, newOrder.id]); 
    });

    socket.on("table_updated", () => {
        fetchTables();
    });

    socket.on("order_status_updated", () => {
        fetchTables();
        refreshDetailsIfOpen();
    });

    socket.on("item_status_updated", () => {
        fetchTables();
        refreshDetailsIfOpen();
    });

    const interval = setInterval(fetchTables, 10000);
    return () => {
        clearInterval(interval);
        socket.disconnect();
    };
  }, [selectedTableId, refreshDetailsIfOpen]);

  const handleAcknowledgeCall = async (tableId: number) => {
    try {
        await fetch(`http://localhost:3000/api/tables/${tableId}/call`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCalling: false })
        });
        fetchTables();
    } catch (error) { console.error(error); }
  };

  const handleViewDetails = async (id: number) => {
    setNewOrderAlerts((prev) => prev.filter((tableId) => tableId !== id));
    setSelectedTableId(id);
    setActiveModal('details');
    setLoadingDetails(true);
    try {
      const res = await fetch(`http://localhost:3000/api/staff/tables/${id}`);
      const data = await res.json();
      if (data.status === 'success') setTableDetails(data.data.items);
    } catch (error) { console.error(error); } 
    finally { setLoadingDetails(false); }
  };

  const handleCheckBill = async (id: number) => {
    setSelectedTableId(id);
    setActiveModal('receipt');
    setLoadingDetails(true);
    try {
      const res = await fetch(`http://localhost:3000/api/staff/tables/${id}`);
      const data = await res.json();
      if (data.status === 'success') setTableDetails(data.data.items);
    } catch (error) { console.error(error); } 
    finally { setLoadingDetails(false); }
  };

  const closeModal = () => { 
      if (activeModal === 'details' && tableDetails.length > 0) {
          const viewedOrderIds = tableDetails.map(item => item.orderId);
          setNewOrderIds(prev => prev.filter(id => !viewedOrderIds.includes(id)));
      }
      setSelectedTableId(null); 
      setActiveModal(null);
      setTableDetails([]); 
  };

  const handleConfirmPayment = async () => {
    if (!selectedTableId) return;
    const tableName = tables.find(t => t.id === selectedTableId)?.name || "";
    if (!confirm(`ยืนยันรับเงินและปิดโต๊ะ ${tableName}?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tables/${selectedTableId}/close`, { 
        method: 'POST' 
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(`💰 ปิดโต๊ะ ${tableName} เรียบร้อย!`); 
        setNewOrderAlerts((prev) => prev.filter((tid) => tid !== selectedTableId));
        fetchTables(); 
        closeModal(); 
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) { console.error(error); alert("เชื่อมต่อ Server ไม่ได้"); }
  };

  const handleToggleTable = async (tableId: number, currentStatus: boolean, isOccupied: boolean) => {
    if (currentStatus === true && isOccupied) { alert("⚠️ ปิดโต๊ะไม่ได้ มีรายการค้างอยู่"); return; }
    try {
      await fetch(`http://localhost:3000/api/tables/${tableId}/availability`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      fetchTables();
    } catch (error) { console.error(error); }
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;
    try {
      const res = await fetch('http://localhost:3000/api/tables', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTableName })
      });
      if (res.ok) { setNewTableName(""); setIsCreating(false); fetchTables(); }
    } catch (error) { console.error(error); }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm("⚠️ ลบโต๊ะ?")) return;
    try { await fetch(`http://localhost:3000/api/tables/${id}`, { method: 'DELETE' }); fetchTables(); } catch (error) { console.error(error); }
  };

  const handleUpdateTableName = async (id: number, oldName: string) => {
    const newName = prompt("ชื่อโต๊ะใหม่:", oldName);
    if (!newName || newName === oldName) return;
    try { await fetch(`http://localhost:3000/api/tables/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) }); fetchTables(); } catch (error) { console.error(error); }
  };

  const handleCancelOrder = async (itemId: number, menuName: string) => {
    if(!confirm(`ต้องการยกเลิกเมนู "${menuName}" ใช่หรือไม่?`)) return;
    try {
        const res = await fetch(`http://localhost:3000/api/staff/items/${itemId}/cancel`, { method: 'PATCH' });
        if (res.ok) { refreshDetailsIfOpen(); fetchTables(); }
    } catch (error) { console.error(error); alert("ยกเลิกรายการไม่สำเร็จ"); }
  };

  const handleChangeStatus = async (itemId: number, newStatus: string, menuName: string) => {
      if (newStatus === 'CANCELLED') {
          handleCancelOrder(itemId, menuName);
          return;
      }
      try {
          const res = await fetch(`http://localhost:3000/api/orders/items/${itemId}/status`, {
              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) refreshDetailsIfOpen();
          else alert("แก้ไขสถานะไม่สำเร็จ");
      } catch (error) { console.error(error); alert("เชื่อมต่อ Server ไม่ได้"); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'COOKING': return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'READY': return 'text-green-600 bg-green-50 border-green-200 font-bold';
        case 'SERVED': return 'text-blue-700 bg-blue-50 border-blue-200 font-bold';
        case 'COMPLETED': return 'text-slate-500 bg-slate-50 border-slate-200';
        case 'CANCELLED': return 'text-red-500 bg-red-50 border-red-200 line-through';
        default: return 'text-slate-500';
    }
  };

  const validItems = tableDetails.filter(i => i.status !== 'CANCELLED');
  const totalAmount = validItems.reduce((sum, i) => sum + i.total, 0);
  const unservedCount = validItems.filter(i => !['SERVED', 'COMPLETED'].includes(i.status)).length;

  return (
    <main className="min-h-screen bg-slate-100 p-6 relative">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">จัดการโต๊ะ & แคชเชียร์ 🏪</h1>
            <p className="text-slate-500 text-sm mt-1">{isEditingMode ? "🔧 โหมดแก้ไข" : "👋 พร้อมให้บริการ"}</p>
        </div>
        <div className="flex gap-2">
            
             {userRole === 'ADMIN' && (
                <Link href="/admin" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm mr-2 transition-colors">
                    <LayoutDashboard size={18} /> <span className="hidden md:inline">Dashboard</span>
                </Link>
             )}

            <button onClick={() => setIsEditingMode(!isEditingMode)} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${isEditingMode ? "bg-slate-800 text-white" : "bg-white border-2 border-slate-200 text-slate-600"}`}>
                {isEditingMode ? <><Check size={18} /> เสร็จสิ้น</> : <><Pencil size={18} /> แก้ไขผัง</>}
            </button>
             <button onClick={() => fetchTables()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">🔄</button>
             
             <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm ml-2">
                <LogOut size={18} /> <span className="hidden md:inline">ออก</span>
             </button>
        </div>
      </header>

      {isEditingMode && (
         <div className="mb-6">
            {!isCreating ? (
                <button onClick={() => setIsCreating(true)} className="w-full bg-slate-200 border-2 border-dashed border-slate-400 text-slate-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300"><Plus size={24} /> เพิ่มโต๊ะใหม่</button>
            ) : (
                <div className="bg-white p-4 rounded-xl shadow-sm flex gap-2 items-center animate-in fade-in zoom-in">
                    <input type="text" placeholder="ชื่อโต๊ะ" className="border p-2 rounded-lg flex-1" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} autoFocus />
                    <button onClick={handleCreateTable} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">บันทึก</button>
                    <button onClick={() => setIsCreating(false)} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><X size={18} /> ยกเลิก</button>
                </div>
            )}
         </div>
      )}

      {loading && tables.length === 0 ? <p className="text-center text-slate-500 py-10">กำลังโหลดข้อมูล...</p> : (
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
                  {!table.isAvailable && !isEditingMode && <div className="absolute top-0 left-0 right-0 bg-slate-500 text-white text-xs text-center py-1 z-10">⛔ ปิดให้บริการ</div>}
                  
                  {table.isCallingStaff ? (
                      <div onClick={() => handleAcknowledgeCall(table.id)} className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold text-center py-1 z-20 cursor-pointer hover:bg-red-700 flex justify-center items-center gap-1 animate-pulse">
                          <Bell size={12} className="fill-current" /> ลูกค้าเรียก!
                      </div>
                  ) : hasNewOrder ? ( 
                      <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-xs font-bold text-center py-1 z-20 flex justify-center items-center gap-1 animate-pulse">
                          <ShoppingBag size={12} className="fill-current" /> มีออเดอร์ใหม่!
                      </div>
                  ) : table.readyOrderCount > 0 ? (
                      <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-xs font-bold text-center py-1 z-20 flex justify-center items-center gap-1 animate-bounce">
                          <ChefHat size={12} /> อาหารพร้อมเสิร์ฟ ({table.readyOrderCount})
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
                          <span className="text-slate-500 text-sm">ยอดสุทธิ</span>
                          <span className={`text-3xl font-bold ${table.isAvailable ? (table.isOccupied ? "text-slate-900" : "text-slate-300") : "text-slate-300"}`}>
                              ฿{table.totalAmount.toLocaleString()}
                          </span>
                          <button onClick={() => handleViewDetails(table.id)} disabled={!table.isAvailable} className="text-xs text-blue-600 underline mt-1 flex items-center gap-1 hover:text-blue-800 disabled:text-slate-400 disabled:no-underline">
                            <Eye size={12} /> ดูรายการ ({table.activeOrders})
                          </button>
                      </div>
                    ) : <div className="text-center text-slate-400 py-4 text-sm">ID: {table.id}<br/>(แก้ไข)</div>}
                  </CardContent>
                  {!isEditingMode && (
                      <CardFooter className="flex gap-2">
                        <Link href={`/?tableId=${table.id}`} target="_blank" className={`flex-1 py-2 rounded-lg font-bold text-center text-sm flex items-center justify-center gap-1 transition-colors ${table.isAvailable ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-slate-200 text-slate-400 pointer-events-none"}`}>
                            <UtensilsCrossed size={16} /> สั่ง
                        </Link>
                        <button onClick={() => handleCheckBill(table.id)} disabled={!table.isAvailable || !table.isOccupied} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${table.isAvailable && table.isOccupied ? "bg-slate-900 text-white hover:bg-slate-700 shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
                            💰 เช็คบิล
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
              <h2 className="text-xl font-bold flex items-center gap-2"><UtensilsCrossed size={20} /> รายการอาหารโต๊ะ {tables.find(t => t.id === selectedTableId)?.name}</h2>
              <button onClick={closeModal} className="text-slate-300 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {loadingDetails ? <p className="text-center text-slate-500 py-10">กำลังโหลดรายการ...</p> : tableDetails.length === 0 ? <div className="text-center py-10 text-slate-500">ยังไม่มีรายการอาหาร</div> : (
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 text-sm">
                      <tr>
                          <th className="p-2 rounded-l">เมนู</th>
                          <th className="p-2 text-center">สถานะ</th>
                          <th className="p-2 text-center">จำนวน</th>
                          <th className="p-2 text-right rounded-r">รวม</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tableDetails.map((item, idx) => {
                      const isCancelled = item.status === 'CANCELLED';
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
                                    {isNewItem && !isCancelled && <span className="shrink-0 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 animate-pulse"><Sparkles size={10} /> NEW</span>}
                                </div>
                            </td>
                            <td className="p-2 text-center">
                                {!isCancelled ? (
                                    <select 
                                        value={item.status} 
                                        onChange={(e) => handleChangeStatus(item.id, e.target.value, item.menuName)} 
                                        className={`text-xs border rounded p-1 font-bold outline-none cursor-pointer ${statusColor}`}
                                    >
                                        <option value="PENDING">🕒 รอคิว</option>
                                        <option value="COOKING">🍳 กำลังทำ</option>
                                        <option value="READY">✨ พร้อมเสิร์ฟ</option>
                                        <option value="SERVED">✅ เสิร์ฟแล้ว</option>
                                        <option value="CANCELLED">❌ ยกเลิกรายการ</option>
                                    </select>
                                ) : <span className="text-xs text-red-500 font-bold border border-red-200 bg-red-50 px-2 py-1 rounded">ยกเลิกแล้ว</span>}
                            </td>
                            <td className="p-2 text-center text-slate-600">x{item.quantity}</td>
                            <td className="p-2 text-right font-bold text-slate-900">{isCancelled ? <span className="line-through text-slate-400">฿{item.total}</span> : `฿${item.total}`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t">
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-600">ยอดรวมสุทธิ</span>
                    <span className="text-2xl font-bold text-slate-900">฿{totalAmount.toLocaleString()}</span>
                 </div>
                <button onClick={closeModal} className="w-full bg-slate-200 text-slate-600 py-3 rounded-lg font-bold">ปิดหน้าต่าง (รับทราบ)</button>
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
               <h2 className="text-2xl font-bold">ใบเสร็จสรุปยอด</h2>
               <p className="text-slate-400">โต๊ะ {tables.find(t => t.id === selectedTableId)?.name}</p>
               <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[60vh]">
               {loadingDetails ? <p className="text-center text-slate-500">กำลังคำนวณ...</p> : (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        {validItems.map((item, idx) => (
                           <div key={idx} className="flex justify-between text-sm border-b border-dashed border-slate-200 pb-2">
                              <div className="flex-1">
                                  <span className="text-slate-800 font-medium">{item.menuName}</span>
                                  <div className="text-xs text-slate-500">x{item.quantity} @ ฿{item.price}</div>
                              </div>
                              <span className="font-bold text-slate-900">฿{item.total}</span>
                           </div>
                        ))}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-slate-600">
                            <span>รายการอาหาร ({validItems.length})</span>
                            <span>฿{totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t">
                            <span>ยอดสุทธิ</span>
                            <span>฿{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {unservedCount > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex gap-2 items-start">
                             <Ban size={18} className="shrink-0 mt-0.5" />
                             <div>
                                 <span className="font-bold block">ไม่สามารถปิดโต๊ะได้</span>
                                 มี {unservedCount} รายการที่ยังไม่เสิร์ฟ กรุณาตรวจสอบ
                             </div>
                        </div>
                    )}
                 </div>
               )}
            </div>

            <div className="p-4 bg-white border-t flex gap-3">
                <button onClick={closeModal} className="flex-1 py-3 rounded-lg border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50">ยกเลิก</button>
                <button 
                    onClick={handleConfirmPayment} 
                    disabled={unservedCount > 0 || loadingDetails}
                    className={`flex-1 py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 ${unservedCount > 0 ? "bg-slate-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-lg"}`}
                >
                    <Coins size={20} /> รับเงินสด
                </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}