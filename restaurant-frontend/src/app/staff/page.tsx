"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react"; 

interface TableStatus {
  id: number;
  name: string;
  isOccupied: boolean;
  totalAmount: number;
  activeOrders: number;
  isAvailable: boolean;
}

export default function StaffPage() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCloseTable = async (tableId: number, tableName: string) => {
    if (!confirm(`ยืนยันการเช็คบิลและปิดโต๊ะ ${tableName}?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/staff/tables/${tableId}/close`, { method: 'POST' });
      if (res.ok) {
        alert(`ปิดโต๊ะ ${tableName} เรียบร้อย! (ระบบปิดรับออเดอร์อัตโนมัติ)`);
        fetchTables();
      }
    } catch (error) {
      console.error(error);
      alert('เชื่อมต่อ Server ไม่ได้');
    }
  };

  // ✅ แก้ไข: เพิ่มการรับค่า isOccupied เพื่อมาเช็คเงื่อนไข
  const handleToggleTable = async (tableId: number, currentStatus: boolean, isOccupied: boolean) => {
    
    // เงื่อนไข 1: ถ้าจะปิด (Turn OFF) แต่โต๊ะยังไม่ว่าง (isOccupied) -> ห้ามปิด
    if (currentStatus === true && isOccupied) {
        alert("⚠️ ไม่สามารถปิดโต๊ะได้เนื่องจากยังมีรายการอาหารค้างอยู่ กรุณาเช็คบิลก่อน");
        return; // จบการทำงาน ไม่ยิง API
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
      alert("เปลี่ยนสถานะไม่สำเร็จ");
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
      alert("สร้างโต๊ะไม่สำเร็จ");
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm("⚠️ คำเตือน: การลบโต๊ะจะลบประวัติออเดอร์ทั้งหมดของโต๊ะนี้ด้วย ยืนยันหรือไม่?")) return;
    try {
      await fetch(`http://localhost:3000/api/tables/${id}`, { method: 'DELETE' });
      fetchTables();
    } catch (error) {
      console.error(error);
      alert("ลบไม่สำเร็จ");
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
      alert("แก้ไขไม่สำเร็จ");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">จัดการโต๊ะ & แคชเชียร์ 🏪</h1>
            <p className="text-slate-500 text-sm mt-1">
                {isEditingMode ? "🔧 กำลังอยู่ในโหมดแก้ไขโต๊ะ" : "👋 พร้อมให้บริการลูกค้า"}
            </p>
        </div>
        
        <div className="flex gap-2">
            {isEditingMode ? (
                <button 
                    onClick={() => setIsEditingMode(false)}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-900 transition-colors"
                >
                    <Check size={18} /> เสร็จสิ้น
                </button>
            ) : (
                <button 
                    onClick={() => setIsEditingMode(true)}
                    className="bg-white border-2 border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
                >
                    <Pencil size={18} /> แก้ไขผังโต๊ะ
                </button>
            )}
             <button 
                onClick={() => fetchTables()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
                🔄
            </button>
        </div>
      </header>

      {/* ส่วนสร้างโต๊ะใหม่ */}
      {isEditingMode && (
         <div className="mb-6">
            {!isCreating ? (
                <button 
                    onClick={() => setIsCreating(true)}
                    className="w-full bg-slate-200 border-2 border-dashed border-slate-400 text-slate-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors"
                >
                    <Plus size={24} /> เพิ่มโต๊ะใหม่
                </button>
            ) : (
                <div className="bg-white p-4 rounded-xl shadow-sm flex gap-2 items-center animate-in fade-in zoom-in">
                    <input 
                        type="text" 
                        placeholder="ชื่อโต๊ะ (เช่น T-99, VIP-2)" 
                        className="border p-2 rounded-lg flex-1"
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        autoFocus
                    />
                    <button onClick={handleCreateTable} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">บันทึก</button>
                    
                    <button 
                        onClick={() => setIsCreating(false)} 
                        className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-300 transition-colors"
                    >
                        <X size={18} /> ยกเลิก
                    </button>
                </div>
            )}
         </div>
      )}

      {loading && tables.length === 0 ? (
        <p className="text-center text-slate-500">กำลังโหลดข้อมูล...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <Card 
              key={table.id} 
              className={`border-2 transition-all relative overflow-hidden ${
                !table.isAvailable 
                  ? "border-slate-200 bg-slate-100 opacity-70" 
                  : table.isOccupied && !isEditingMode
                    ? "border-orange-400 bg-orange-50/50" 
                    : "border-slate-200 bg-white" 
              }`}
            >
              {!table.isAvailable && !isEditingMode && (
                  <div className="absolute top-0 left-0 right-0 bg-slate-500 text-white text-xs text-center py-1 z-10">
                      ⛔ ปิดให้บริการ
                  </div>
              )}

              <CardHeader className="pb-2 mt-2">
                <div className="flex justify-between items-center">
                  <CardTitle className={`text-2xl font-bold ${!table.isAvailable ? 'text-slate-400' : 'text-slate-800'}`}>
                    {table.name}
                  </CardTitle>
                  
                  {!isEditingMode && (
                      <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${table.isAvailable ? 'text-green-600' : 'text-slate-400'}`}>
                              {table.isAvailable ? 'ON' : 'OFF'}
                          </span>
                          <button
                            onClick={() => handleToggleTable(table.id, table.isAvailable, table.isOccupied)}
                            className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${
                                table.isAvailable 
                                    ? (table.isOccupied ? 'bg-green-500/50 cursor-not-allowed' : 'bg-green-500') 
                                    : 'bg-slate-300'
                            }`}
                          >
                              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                                  table.isAvailable ? 'translate-x-4' : 'translate-x-0'
                              }`} />
                          </button>
                      </div>
                  )}

                  {isEditingMode && (
                      <div className="flex gap-1">
                          <button 
                            onClick={() => handleUpdateTableName(table.id, table.name)}
                            className="p-1 bg-slate-100 rounded hover:bg-slate-200 text-blue-600"
                          >
                              <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteTable(table.id)}
                            className="p-1 bg-slate-100 rounded hover:bg-red-100 text-red-600"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col space-y-1">
                  {!isEditingMode ? (
                      <>
                        <span className="text-slate-500 text-sm">ยอดสุทธิ</span>
                        <span className={`text-3xl font-bold ${table.isAvailable ? (table.isOccupied ? "text-slate-900" : "text-slate-300") : "text-slate-300"}`}>
                            ฿{table.totalAmount.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">
                            ({table.activeOrders} ออเดอร์)
                        </span>
                      </>
                  ) : (
                      <div className="text-center text-slate-400 py-4 text-sm">
                          ID: {table.id} <br/>
                          (แก้ไขผังโต๊ะ)
                      </div>
                  )}
                </div>
              </CardContent>

              {!isEditingMode && (
                  <CardFooter>
                    <button
                    onClick={() => handleCloseTable(table.id, table.name)}
                    disabled={!table.isAvailable || !table.isOccupied}
                    className={`w-full py-2 rounded-lg font-bold transition-colors ${
                        table.isAvailable && table.isOccupied
                        ? "bg-slate-900 text-white hover:bg-slate-700 shadow-md"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                    >
                    {table.isOccupied ? "💰 เช็คบิล" : "ไม่มีรายการ"}
                    </button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}