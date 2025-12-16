"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Clock, ChefHat, BellRing, RefreshCw, LogOut } from "lucide-react";

// --- Types ---
type ItemStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';

interface RawOrderItem {
  id: number;
  quantity: number;
  note?: string;
  status: ItemStatus;
  menu: {
    nameTH: string;
  };
}

interface RawOrder {
  id: number;
  table: {
    name: string;
  };
  createdAt: string;
  items: RawOrderItem[];
}

interface KitchenItem {
  id: number;          
  orderId: number;     
  tableName: string;   
  menuName: string;    
  quantity: number;    
  note?: string;       
  status: ItemStatus;
  createdAt: string;   
}

export default function KitchenPage() {
  const router = useRouter();
  const [items, setItems] = useState<KitchenItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); 
    }
  }, [router]);

  const handleLogout = () => {
    if (confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  const flattenOrders = (orders: RawOrder[]): KitchenItem[] => {
    return orders.flatMap((order) => 
      order.items
        .filter((item) => item.status !== 'CANCELLED' && item.status !== 'SERVED' && item.status !== 'COMPLETED')
        .map((item) => ({
          id: item.id,
          orderId: order.id,
          tableName: order.table.name,
          menuName: item.menu.nameTH,
          quantity: item.quantity,
          note: item.note,
          status: item.status,
          createdAt: order.createdAt
        }))
    );
  };

  const fetchActiveItems = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/orders/active');
      const data = await res.json();
      if (data.status === 'success') {
        const flatItems = flattenOrders(data.data);
        setItems(flatItems);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    fetchActiveItems();
    const socket = io("http://localhost:3000");

    socket.on("new_order", (newOrder: RawOrder) => {
        const newItems = newOrder.items.map((item) => ({
            id: item.id,
            orderId: newOrder.id,
            tableName: newOrder.table.name,
            menuName: item.menu.nameTH,
            quantity: item.quantity,
            note: item.note,
            status: item.status,
            createdAt: newOrder.createdAt
        }));
        setItems(prev => [...prev, ...newItems]); 
    });
    
    socket.on("item_status_updated", (updatedItem: KitchenItem) => {
       setItems(prev => {
           if (['SERVED', 'COMPLETED', 'CANCELLED'].includes(updatedItem.status)) {
               return prev.filter(i => i.id !== updatedItem.id);
           }
           return prev.map(i => i.id === updatedItem.id ? { ...i, status: updatedItem.status } : i);
       });
    });

    socket.on("order_status_updated", () => {
        fetchActiveItems();
    });

    return () => { socket.disconnect(); };
  }, [fetchActiveItems]);

  const handleUpdateStatus = async (itemId: number, newStatus: ItemStatus) => {
    setItems(prev => {
        if (newStatus === 'SERVED') return prev.filter(i => i.id !== itemId);
        return prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i);
    });

    try {
      await fetch(`http://localhost:3000/api/orders/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) { 
        console.error(error); 
        fetchActiveItems(); 
    }
  };

  const pendingItems = items.filter(i => i.status === 'PENDING');
  const cookingItems = items.filter(i => i.status === 'COOKING');
  const readyItems = items.filter(i => i.status === 'READY');

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">Loading...</div>;

  return (
    <main className="h-screen flex flex-col p-4 bg-slate-900 text-white overflow-hidden">
      
      {/* Header */}
      <header className="shrink-0 flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            👨‍🍳 Kitchen Display
            <span className="text-xs font-normal bg-green-600 px-3 py-1 rounded-full animate-pulse">Live</span>
        </h1>
        <div className="flex gap-2">
            <button onClick={fetchActiveItems} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors" title="Refresh">
                <RefreshCw size={20} />
            </button>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition-colors" title="Logout">
                <LogOut size={20} />
            </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        
        {/* Column 1: PENDING */}
        <div className="flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <h2 className="shrink-0 font-bold text-lg text-yellow-400 flex items-center gap-2 p-4 pb-2 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm z-10">
                <Clock /> รอคิว (Pending) 
                <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">{pendingItems.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 custom-scrollbar">
                {pendingItems.map(item => (
                    <KitchenCard key={item.id} item={item} 
                        btnLabel="🔥 เริ่มทำ" 
                        btnColor="bg-yellow-600 hover:bg-yellow-700" 
                        onAction={() => handleUpdateStatus(item.id, 'COOKING')} 
                    />
                ))}
            </div>
        </div>

        {/* Column 2: COOKING */}
        <div className="flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <h2 className="shrink-0 font-bold text-lg text-orange-400 flex items-center gap-2 p-4 pb-2 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm z-10">
                <ChefHat /> กำลังปรุง (Cooking) 
                <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">{cookingItems.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 custom-scrollbar">
                {cookingItems.map(item => (
                    <KitchenCard key={item.id} item={item} 
                        btnLabel="✅ เสร็จแล้ว" 
                        btnColor="bg-orange-600 hover:bg-orange-700" 
                        onAction={() => handleUpdateStatus(item.id, 'READY')} 
                    />
                ))}
            </div>
        </div>

        {/* Column 3: READY */}
        <div className="flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <h2 className="shrink-0 font-bold text-lg text-green-400 flex items-center gap-2 p-4 pb-2 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm z-10">
                <BellRing /> รอเสิร์ฟ (Ready) 
                <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">{readyItems.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 custom-scrollbar">
                {readyItems.map(item => (
                    <KitchenCard key={item.id} item={item} 
                        btnLabel="🚀 เสิร์ฟแล้ว" 
                        btnColor="bg-green-600 hover:bg-green-700 shadow-green-900/20" 
                        onAction={() => handleUpdateStatus(item.id, 'SERVED')} 
                    />
                ))}
            </div>
        </div>

      </div>
    </main>
  );
}

function KitchenCard({ item, btnLabel, btnColor, onAction }: { item: KitchenItem, btnLabel: string, btnColor: string, onAction: () => void }) {
    return (
        <Card className="bg-slate-800 border-slate-600 text-slate-100 shadow-lg">
            <CardHeader className="p-3 bg-slate-900/50 flex flex-row justify-between items-start border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {item.tableName}
                    </span>
                    <span className="text-xs text-slate-400">#{item.orderId}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                    {new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute:'2-digit' })}
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-white leading-tight">{item.menuName}</div>
                        {item.note && (
                          <div className="text-red-400 text-sm italic mt-1 break-words">
                            *{item.note}
                          </div>
                        )}
                    </div>
                    <div className="bg-slate-700 px-3 py-1 rounded-lg ml-2">
                        <span className="text-xl font-bold text-yellow-500">x{item.quantity}</span>
                    </div>
                </div>

                <button 
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 shadow-md ${btnColor}`} 
                    onClick={onAction}
                >
                    {btnLabel}
                </button>
            </CardContent>
        </Card>
    );
}