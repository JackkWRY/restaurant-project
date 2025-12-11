"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

// กำหนด Type ให้ตรงกับที่ Backend ส่งมา
interface TableStatus {
  id: number;
  name: string;
  isOccupied: boolean;
  totalAmount: number;
  activeOrders: number;
}

export default function StaffPage() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลโต๊ะล่าสุด
  const fetchTables = async () => {
    try {
      setLoading(true);
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

  // ดึงข้อมูลตอนเปิดหน้าเว็บ
  useEffect(() => {
    fetchTables();
    
    // (Optional) ตั้งเวลาดึงข้อมูลใหม่ทุกๆ 10 วินาที เพื่อให้เห็นยอดอัปเดต
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, []);

  // ฟังก์ชันปิดโต๊ะ (เช็คบิล)
  const handleCloseTable = async (tableId: number, tableName: string) => {
    if (!confirm(`ยืนยันการเช็คบิลและปิดโต๊ะ ${tableName}?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/staff/tables/${tableId}/close`, {
        method: 'POST'
      });
      
      if (res.ok) {
        alert(`ปิดโต๊ะ ${tableName} เรียบร้อย!`);
        fetchTables(); // ดึงข้อมูลใหม่ทันที
      } else {
        alert('เกิดข้อผิดพลาดในการปิดโต๊ะ');
      }
    } catch (error) {
      console.error(error);
      alert('เชื่อมต่อ Server ไม่ได้');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">จัดการโต๊ะ & แคชเชียร์ 🏪</h1>
        <button 
          onClick={fetchTables}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          🔄 รีเฟรชข้อมูล
        </button>
      </header>

      {loading && tables.length === 0 ? (
        <p className="text-center text-slate-500">กำลังโหลดข้อมูล...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <Card 
              key={table.id} 
              className={`border-2 transition-all ${
                table.isOccupied 
                  ? "border-orange-400 bg-orange-50/50" 
                  : "border-green-400 bg-green-50/50"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    {table.name}
                  </CardTitle>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    table.isOccupied ? "bg-orange-200 text-orange-800" : "bg-green-200 text-green-800"
                  }`}>
                    {table.isOccupied ? "ไม่ว่าง" : "ว่าง"}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-500 text-sm">ยอดสุทธิ</span>
                  <span className={`text-3xl font-bold ${table.isOccupied ? "text-slate-900" : "text-slate-300"}`}>
                    ฿{table.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({table.activeOrders} ออเดอร์ที่ยังไม่จ่าย)
                  </span>
                </div>
              </CardContent>

              <CardFooter>
                <button
                  onClick={() => handleCloseTable(table.id, table.name)}
                  disabled={!table.isOccupied}
                  className={`w-full py-2 rounded-lg font-bold transition-colors ${
                    table.isOccupied
                      ? "bg-slate-900 text-white hover:bg-slate-700 shadow-md"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {table.isOccupied ? "💰 เช็คบิล / ปิดโต๊ะ" : "ไม่มีรายการ"}
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}