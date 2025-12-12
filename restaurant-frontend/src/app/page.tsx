"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client"; 
import { QrCode, Lock, Bell, History, X } from "lucide-react"; 
import MenuItem from "@/components/MenuItem"; 
import FloatingCart from "@/components/FloatingCart"; 
import TableDetector from "@/components/TableDetector"; 

// --- Types ---
interface Menu {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
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
}
interface TableInfo {
    id: number; 
    name: string;
    isAvailable: boolean;
    isCallingStaff: boolean;
}

// --- Main Component ---
export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const tableIdParam = searchParams.get("tableId");
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State ชื่อร้าน
  const [restaurantName, setRestaurantName] = useState("ร้านอาหาร 🍳");

  // State สำหรับ Modal ประวัติ
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // State สำหรับปุ่มเรียกพนักงาน
  const [isCalling, setIsCalling] = useState(false);

  // Load Initial Data & Connect Socket
  useEffect(() => {
    if (!tableIdParam) {
        setLoading(false);
        return;
    }

    const initData = async () => {
        try {
            // 1. ดึงเมนู
            const resMenu = await fetch('http://localhost:3000/api/menus');
            const dataMenu = await resMenu.json();
            if (dataMenu.status === 'success') setCategories(dataMenu.data);

            // 2. ดึงข้อมูลโต๊ะ
            const resTable = await fetch(`http://localhost:3000/api/tables/${tableIdParam}`);
            const dataTable = await resTable.json();
            if (dataTable.status === 'success') {
                setTableInfo(dataTable.data);
                setIsCalling(dataTable.data.isCallingStaff); // Sync สถานะเริ่มต้น
            }

            // 3. ดึงชื่อร้าน (เพิ่มใหม่)
            const resName = await fetch('http://localhost:3000/api/settings/name');
            const dataName = await resName.json();
            if (dataName.status === 'success') setRestaurantName(dataName.data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    initData();

    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
        console.log("✅ Customer connected to socket");
    });

    socket.on("table_updated", (updatedTable: TableInfo) => {
        if (String(updatedTable.id) === String(tableIdParam)) {
            console.log("🔔 Table Updated:", updatedTable);
            
            setIsCalling(updatedTable.isCallingStaff);

            setTableInfo(prev => prev ? { 
                ...prev, 
                isAvailable: updatedTable.isAvailable,
                name: updatedTable.name,
                id: updatedTable.id
            } : null);
        }
    });

    return () => {
        socket.disconnect();
    };

  }, [tableIdParam]);

  // ฟังก์ชันเรียกพนักงาน
  const handleCallStaff = async () => {
    if (!tableIdParam) return;
    
    const newStatus = !isCalling;
    setIsCalling(newStatus); 

    try {
        await fetch(`http://localhost:3000/api/tables/${tableIdParam}/call`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCalling: newStatus })
        });
        if (newStatus) alert("🔔 เรียกพนักงานแล้ว กรุณารอสักครู่");
        else alert("🔕 ยกเลิกการเรียกแล้ว");
    } catch (error) {
        console.error(error);
        alert("ส่งคำขอไม่สำเร็จ");
        setIsCalling(!newStatus); 
    }
  };

  // ฟังก์ชันดูประวัติ
  const handleViewHistory = async () => {
    if (!tableIdParam) return;
    setShowHistory(true);
    try {
        const res = await fetch(`http://localhost:3000/api/tables/${tableIdParam}/orders`);
        const data = await res.json();
        if (data.status === 'success') {
            setHistoryItems(data.data);
        }
    } catch (error) {
        console.error(error);
    }
  };

  // --- Render Conditions ---

  if (!loading && !tableIdParam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full">
          <div className="bg-slate-100 p-4 rounded-full mb-6">
            <QrCode size={64} className="text-slate-800" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">กรุณาสแกน QR Code</h1>
          <p className="text-slate-500 mb-6">เพื่อระบุโต๊ะและเริ่มสั่งอาหาร</p>
        </div>
      </div>
    );
  }

  if (!loading && tableInfo && !tableInfo.isAvailable) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full border-t-4 border-red-500">
                <div className="bg-red-50 p-4 rounded-full mb-6">
                    <Lock size={64} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">โต๊ะนี้ปิดให้บริการ</h1>
                <p className="text-slate-500 mb-6">กรุณาติดต่อพนักงาน</p>
            </div>
        </div>
      );
  }

  return (
    <main className="container mx-auto p-4 max-w-md min-h-screen bg-white pb-24 relative">
      <TableDetector />

      <header className="mb-6 mt-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">{restaurantName}</h1>
            
            <p className="text-slate-500 text-sm">
            โต๊ะ: <span className="font-bold text-green-600">{tableInfo?.name || tableIdParam}</span>
            </p>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={handleCallStaff}
                className={`p-2 rounded-full shadow-sm border transition-all ${
                    isCalling 
                    ? "bg-red-100 text-red-600 border-red-200 animate-pulse" 
                    : "bg-white text-slate-600 border-slate-200"
                }`}
            >
                <Bell size={20} className={isCalling ? "fill-current" : ""} />
            </button>
            <button 
                onClick={handleViewHistory}
                className="p-2 rounded-full bg-white text-slate-600 shadow-sm border border-slate-200"
            >
                <History size={20} />
            </button>
        </div>
      </header>
      
      {categories.length === 0 && !loading ? (
        <div className="text-center p-10 bg-slate-50 rounded-lg border border-dashed">
          <p className="text-red-500 font-medium">ไม่พบเมนูอาหาร</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <section key={cat.id}>
              <h2 className="text-xl font-bold mb-3 text-slate-800 border-l-4 border-slate-800 pl-3">
                {cat.name}
              </h2>
              <div className="grid gap-4">
                {cat.menus.map((menu) => (
                  <MenuItem 
                    key={menu.id}
                    id={menu.id}
                    nameTH={menu.nameTH}
                    price={menu.price}
                    imageUrl={menu.imageUrl}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <FloatingCart />

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><History size={18}/> รายการที่สั่งไปแล้ว</h3>
                    <button onClick={() => setShowHistory(false)}><X size={24}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                    {historyItems.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">ยังไม่มีรายการที่สั่ง</p>
                    ) : (
                        <div className="space-y-3">
                            {historyItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                                    <div>
                                        <div className="font-bold text-slate-800">{item.menuName}</div>
                                        <div className="text-xs text-slate-500">
                                            สถานะ: <span className="font-bold text-blue-600">{item.status}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-600">x{item.quantity}</div>
                                        <div className="font-bold text-slate-900">฿{item.total}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t">
                     <div className="flex justify-between text-lg font-bold text-slate-900">
                        <span>ยอดรวมทั้งหมด</span>
                        <span>฿{historyItems.reduce((sum, i) => sum + i.total, 0).toLocaleString()}</span>
                     </div>
                </div>
            </div>
        </div>
      )}
    </main>
  );
}