"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client"; 
import { QrCode, Lock, Bell, History, X, ChevronDown, ChevronUp } from "lucide-react";
import MenuItem from "@/components/MenuItem"; 
import FloatingCart from "@/components/FloatingCart"; 
import TableDetector from "@/components/TableDetector"; 
import { useCartStore } from "@/store/useCartStore";

// --- Types ---
interface Menu {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
  isRecommended: boolean;
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
  
  const { totalItems } = useCartStore(); 

  const [categories, setCategories] = useState<Category[]>([]);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("ร้านอาหาร 🍳");

  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isCalling, setIsCalling] = useState(false);

  const handleViewHistory = useCallback(async () => {
    if (!tableIdParam) return;
    setShowHistory(true);
    try {
        const res = await fetch(`http://localhost:3000/api/tables/${tableIdParam}/orders`);
        const data = await res.json();
        if (data.status === 'success') setHistoryItems(data.data);
    } catch (error) { console.error(error); }
  }, [tableIdParam]);

  useEffect(() => {
    if (!tableIdParam) {
        setLoading(false);
        return;
    }

    const initData = async () => {
        try {
            const resMenu = await fetch('http://localhost:3000/api/menus');
            const dataMenu = await resMenu.json();
            if (dataMenu.status === 'success') setCategories(dataMenu.data);

            const resTable = await fetch(`http://localhost:3000/api/tables/${tableIdParam}`);
            const dataTable = await resTable.json();
            if (dataTable.status === 'success') {
                setTableInfo(dataTable.data);
                setIsCalling(dataTable.data.isCallingStaff);
            }

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
    socket.on("connect", () => { console.log("✅ Customer connected to socket"); });
    socket.on("table_updated", (updatedTable: TableInfo) => {
        if (String(updatedTable.id) === String(tableIdParam)) {
            setIsCalling(updatedTable.isCallingStaff);
            setTableInfo(prev => prev ? { ...prev, ...updatedTable } : null);
        }
    });

    socket.on("order_status_updated", () => {
        if (showHistory) handleViewHistory(); 
    });

    return () => { socket.disconnect(); };
  }, [tableIdParam, showHistory, handleViewHistory]);

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

  const getStatusDisplay = (status: string) => {
    switch (status) {
        case 'PENDING': return { label: '🕒 รอคิว', color: 'text-yellow-600' };
        case 'COOKING': return { label: '🍳 กำลังทำ', color: 'text-orange-600' };
        case 'READY': return { label: '✨ พร้อมเสิร์ฟ', color: 'text-green-600 animate-pulse font-bold' };
        case 'SERVED': return { label: '✅ เสิร์ฟแล้ว', color: 'text-green-700 font-bold' };
        case 'COMPLETED': return { label: '💰 จ่ายแล้ว', color: 'text-slate-500' };
        case 'CANCELLED': return { label: '❌ ยกเลิกแล้ว', color: 'text-red-500 font-bold' };
        default: return { label: status, color: 'text-slate-500' };
    }
  };

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

      <header className="mb-6 mt-4 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-3 border-b">
        <div>
            <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{restaurantName}</h1>
            <p className="text-slate-500 text-xs">
            โต๊ะ: <span className="font-bold text-green-600">{tableInfo?.name || tableIdParam}</span>
            </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
            <button 
                onClick={handleCallStaff}
                className={`p-2 rounded-full shadow-sm border transition-all ${
                    isCalling ? "bg-red-100 text-red-600 border-red-200 animate-pulse" : "bg-white text-slate-600 border-slate-200"
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
        <div className="space-y-4">
          {categories.map((cat) => (
            <CategoryAccordion key={cat.id} category={cat} />
          ))}
        </div>
      )}

      {totalItems() > 0 && <FloatingCart />}

      {/* Modal History */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><History size={18}/> ประวัติการสั่ง</h3>
                    <button onClick={() => setShowHistory(false)}><X size={24}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                    {historyItems.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">ยังไม่มีรายการที่สั่ง</p>
                    ) : (
                        <div className="space-y-3">
                            {historyItems.map((item, idx) => {
                                const { label, color } = getStatusDisplay(item.status);
                                const isCancelled = item.status === 'CANCELLED';
                                return (
                                    <div key={idx} className={`flex justify-between items-start border-b pb-3 last:border-0 ${isCancelled ? 'bg-slate-50 opacity-60' : ''}`}>
                                        <div>
                                            <div className={`font-bold text-lg ${isCancelled ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                                {item.menuName}
                                            </div>
                                            <div className={`text-xs mt-1 ${color}`}>
                                                {label}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-500">x{item.quantity}</div>
                                            <div className={`font-bold ${isCancelled ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                                ฿{item.total}
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
                        <span>ยอดรวม</span>
                        <span>
                            ฿{historyItems
                                .filter(i => i.status !== 'CANCELLED')
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

function CategoryAccordion({ category }: { category: Category }) {
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
                            />
                        ))}
                        {category.menus.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-4">ไม่มีรายการอาหารในหมวดนี้</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}