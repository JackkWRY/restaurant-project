"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; 
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Pencil, Trash2, Plus, X, Check, Eye, UtensilsCrossed } from "lucide-react"; 

// Type สำหรับรายการโต๊ะหน้าหลัก
interface TableStatus {
  id: number;
  name: string;
  isOccupied: boolean;
  totalAmount: number;
  activeOrders: number;
  isAvailable: boolean;
}

// Type สำหรับรายละเอียดใน Modal (Item)
interface OrderDetailItem {
  id: number;
  menuName: string;
  price: number;
  quantity: number;
  total: number;
  status: string;
}

export default function StaffPage() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Edit Mode
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // State Modal Detail
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [tableDetails, setTableDetails] = useState<OrderDetailItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. ดึงข้อมูลรวม
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
    fetchTables();
    const interval = setInterval(fetchTables, 5000); 
    return () => clearInterval(interval);
  }, []);

  // 2. ดึงรายละเอียดเมื่อกดเลือกโต๊ะ
  const handleViewDetails = async (id: number) => {
    setSelectedTableId(id);
    setLoadingDetails(true);
    try {
      const res = await fetch(`http://localhost:3000/api/staff/tables/${id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setTableDetails(data.data.items);
      }
    } catch (error) {
      console.error(error);
      alert("ดูรายละเอียดไม่ได้");
    } finally {
      setLoadingDetails(false);
    }
  };

  // ปิด Modal
  const closeModal = () => {
    setSelectedTableId(null);
    setTableDetails([]);
  };

  const handleCloseTable = async (tableId: number, tableName: string) => {
    if (!confirm(`ยืนยันการเช็คบิลและปิดโต๊ะ ${tableName}?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/staff/tables/${tableId}/close`, { method: 'POST' });
      if (res.ok) {
        alert(`ปิดโต๊ะ ${tableName} เรียบร้อย!`);
        fetchTables();
        closeModal(); 
      }
    } catch (error) {
      console.error(error);
      alert('เชื่อมต่อ Server ไม่ได้');
    }
  };

  const handleToggleTable = async (tableId: number, currentStatus: boolean, isOccupied: boolean) => {
    if (currentStatus === true && isOccupied) {
        alert("⚠️ ไม่สามารถปิดโต๊ะได้เนื่องจากยังมีรายการอาหารค้างอยู่");
        return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/tables/${tableId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      if (res.ok) {
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, isAvailable: !currentStatus } : t));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- CRUD Functions ---
  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;
    try {
      const res = await fetch('http://localhost:3000/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTableName })
      });
      if (res.ok) {
        setNewTableName("");
        setIsCreating(false);
        fetchTables();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm("⚠️ คำเตือน: ลบโต๊ะ?")) return;
    try {
      await fetch(`http://localhost:3000/api/tables/${id}`, { method: 'DELETE' });
      fetchTables();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTableName = async (id: number, oldName: string) => {
    const newName = prompt("ใส่ชื่อโต๊ะใหม่:", oldName);
    if (!newName || newName === oldName) return;
    try {
      await fetch(`http://localhost:3000/api/tables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      fetchTables();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 relative">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">จัดการโต๊ะ & แคชเชียร์ 🏪</h1>
            <p className="text-slate-500 text-sm mt-1">
                {isEditingMode ? "🔧 โหมดแก้ไข" : "👋 พร้อมให้บริการ"}
            </p>
        </div>
        <div className="flex gap-2">
            {isEditingMode ? (
                <button onClick={() => setIsEditingMode(false)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Check size={18} /> เสร็จสิ้น
                </button>
            ) : (
                <button onClick={() => setIsEditingMode(true)} className="bg-white border-2 border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Pencil size={18} /> แก้ไขผัง
                </button>
            )}
             <button onClick={() => fetchTables()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">🔄</button>
        </div>
      </header>

      {/* Create Table Section */}
      {isEditingMode && (
         <div className="mb-6">
            {!isCreating ? (
                <button onClick={() => setIsCreating(true)} className="w-full bg-slate-200 border-2 border-dashed border-slate-400 text-slate-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300">
                    <Plus size={24} /> เพิ่มโต๊ะใหม่
                </button>
            ) : (
                <div className="bg-white p-4 rounded-xl shadow-sm flex gap-2 items-center animate-in fade-in zoom-in">
                    <input type="text" placeholder="ชื่อโต๊ะ" className="border p-2 rounded-lg flex-1" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} autoFocus />
                    <button onClick={handleCreateTable} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">บันทึก</button>
                    <button onClick={() => setIsCreating(false)} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><X size={18} /> ยกเลิก</button>
                </div>
            )}
         </div>
      )}

      {loading && tables.length === 0 ? (
        <p className="text-center text-slate-500 py-10">กำลังโหลดข้อมูล...</p>
      ) : (
        /* Tables Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((table) => (
              <Card key={table.id} className={`border-2 transition-all relative overflow-hidden ${
                  !table.isAvailable ? "border-slate-200 bg-slate-100 opacity-70" 
                  : table.isOccupied && !isEditingMode ? "border-orange-400 bg-orange-50/50" : "border-slate-200 bg-white"
              }`}>
                {!table.isAvailable && !isEditingMode && (
                    <div className="absolute top-0 left-0 right-0 bg-slate-500 text-white text-xs text-center py-1 z-10">⛔ ปิดให้บริการ</div>
                )}

                <CardHeader className="pb-2 mt-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className={`text-2xl font-bold ${!table.isAvailable ? 'text-slate-400' : 'text-slate-800'}`}>{table.name}</CardTitle>
                    
                    {!isEditingMode && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleTable(table.id, table.isAvailable, table.isOccupied)} className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${table.isAvailable ? (table.isOccupied ? 'bg-green-500/50 cursor-not-allowed' : 'bg-green-500') : 'bg-slate-300'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${table.isAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    )}
                    {isEditingMode && (
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
                        
                        <button 
                          onClick={() => handleViewDetails(table.id)}
                          disabled={!table.isAvailable}
                          className="text-xs text-blue-600 underline mt-1 flex items-center gap-1 hover:text-blue-800 disabled:text-slate-400 disabled:no-underline"
                        >
                          <Eye size={12} /> ดูรายการ ({table.activeOrders})
                        </button>
                    </div>
                  ) : (
                      <div className="text-center text-slate-400 py-4 text-sm">ID: {table.id}<br/>(แก้ไข)</div>
                  )}
                </CardContent>

                {!isEditingMode && (
                    <CardFooter className="flex gap-2">
                      <Link 
                          href={`/?tableId=${table.id}`} 
                          target="_blank" 
                          className={`flex-1 py-2 rounded-lg font-bold text-center text-sm flex items-center justify-center gap-1 transition-colors ${
                              table.isAvailable 
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none"
                          }`}
                      >
                          <UtensilsCrossed size={16} /> สั่ง
                      </Link>

                      <button
                          onClick={() => handleCloseTable(table.id, table.name)}
                          disabled={!table.isAvailable || !table.isOccupied}
                          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                              table.isAvailable && table.isOccupied
                              ? "bg-slate-900 text-white hover:bg-slate-700 shadow-md"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                      >
                          💰 เช็คบิล
                      </button>
                  </CardFooter>
                )}
              </Card>
            ))}
        </div>
      )}

      {/* Modal แสดงรายละเอียดรายการอาหาร */}
      {selectedTableId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UtensilsCrossed size={20} /> รายการอาหารโต๊ะ {tables.find(t => t.id === selectedTableId)?.name}
              </h2>
              <button onClick={closeModal} className="text-slate-300 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {loadingDetails ? (
                <p className="text-center text-slate-500 py-10">กำลังโหลดรายการ...</p>
              ) : tableDetails.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <p>ยังไม่มีรายการอาหาร</p>
                    <Link 
                        href={`/?tableId=${selectedTableId}`} 
                        target="_blank"
                        className="text-blue-600 underline mt-2 inline-block"
                    >
                        กดสั่งอาหารเลย
                    </Link>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 text-sm">
                    <tr>
                      <th className="p-2 rounded-l">เมนู</th>
                      <th className="p-2 text-center">จำนวน</th>
                      <th className="p-2 text-right rounded-r">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tableDetails.map((item, idx) => (
                      <tr key={`${item.id}-${idx}`}>
                        <td className="p-2 text-slate-800 font-medium">
                            {item.menuName}
                            <div className="text-xs text-slate-400 font-normal">{item.status}</div>
                        </td>
                        <td className="p-2 text-center text-slate-600">x{item.quantity}</td>
                        <td className="p-2 text-right text-slate-900 font-bold">฿{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
                <div className="text-slate-500 text-sm">
                    รวม {tableDetails.reduce((sum, i) => sum + i.quantity, 0)} รายการ
                </div>
                <div className="text-xl font-bold text-slate-900">
                    ยอดรวม ฿{tableDetails.reduce((sum, i) => sum + i.total, 0).toLocaleString()}
                </div>
            </div>
            
            <div className="p-4 bg-white border-t flex gap-2">
                <Link 
                    href={`/?tableId=${selectedTableId}`} 
                    target="_blank"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold text-center hover:bg-blue-700"
                >
                    + สั่งเพิ่ม
                </Link>
                <button 
                    onClick={() => {
                        const tableName = tables.find(t => t.id === selectedTableId)?.name || "";
                        handleCloseTable(selectedTableId, tableName);
                    }}
                    disabled={tableDetails.length === 0}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    💰 เช็คบิลเลย
                </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}