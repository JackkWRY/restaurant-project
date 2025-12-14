"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, ChefHat, BellRing, RefreshCw } from "lucide-react";

type OrderStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';

interface OrderItem {
  id: number;
  quantity: number;
  note?: string;
  menu: { nameTH: string };
}

interface Order {
  id: number;
  tableId: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  table?: { name: string };
}

interface KitchenCardProps {
  order: Order;
  btnLabel: string;
  btnColor: string;
  onAction: () => void;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/orders/active');
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    const socket = io("http://localhost:3000");

    socket.on("new_order", (newOrder: Order) => {
      setOrders((prev) => [...prev, newOrder]); 
    });
    
    socket.on("order_status_updated", (updatedOrder: Order) => {
       setOrders((prev) => {
           if (['SERVED', 'COMPLETED', 'CANCELLED'].includes(updatedOrder.status)) {
               return prev.filter(o => o.id !== updatedOrder.id);
           }
           return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
       });
    });

    return () => { socket.disconnect(); };
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    setOrders(prev => {
        if (newStatus === 'SERVED') {
            return prev.filter(o => o.id !== orderId);
        }
        return prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    });

    try {
      await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) { 
        console.error(error); 
        fetchActiveOrders(); 
    }
  };

  // แยกกลุ่มออเดอร์
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const cookingOrders = orders.filter(o => o.status === 'COOKING');
  const readyOrders = orders.filter(o => o.status === 'READY');

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">Loading...</div>;

  return (
    <main className="p-4 min-h-screen bg-slate-900 text-white overflow-x-hidden">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            👨‍🍳 Kitchen Display (KDS)
            <span className="text-xs font-normal bg-green-600 px-3 py-1 rounded-full animate-pulse">Live</span>
        </h1>
        <button onClick={fetchActiveOrders} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700"><RefreshCw size={20} /></button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
        
        {/* Column 1: PENDING -> COOKING */}
        <div className="flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h2 className="font-bold text-lg text-yellow-400 flex items-center gap-2 border-b border-slate-700 pb-2">
                <Clock /> รอคิว (Pending) 
                <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">{pendingOrders.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {pendingOrders.map(order => (
                    <KitchenCard key={order.id} order={order} 
                        btnLabel="🔥 เริ่มทำ" 
                        btnColor="bg-yellow-600 hover:bg-yellow-700" 
                        onAction={() => handleUpdateStatus(order.id, 'COOKING')} 
                    />
                ))}
            </div>
        </div>

        {/* Column 2: COOKING -> READY */}
        <div className="flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h2 className="font-bold text-lg text-orange-400 flex items-center gap-2 border-b border-slate-700 pb-2">
                <ChefHat /> กำลังปรุง (Cooking) 
                <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">{cookingOrders.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {cookingOrders.map(order => (
                    <KitchenCard key={order.id} order={order} 
                        btnLabel="✅ เสร็จแล้ว (พร้อมเสิร์ฟ)" 
                        btnColor="bg-orange-600 hover:bg-orange-700" 
                        onAction={() => handleUpdateStatus(order.id, 'READY')} 
                    />
                ))}
            </div>
        </div>

        {/* Column 3: READY -> SERVED */}
        <div className="flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h2 className="font-bold text-lg text-green-400 flex items-center gap-2 border-b border-slate-700 pb-2">
                <BellRing /> รอเสิร์ฟ (Ready) 
                <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">{readyOrders.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {readyOrders.map(order => (
                    <KitchenCard key={order.id} order={order} 
                        btnLabel="🚀 เสิร์ฟแล้ว (นำออกจากจอ)" 
                        btnColor="bg-green-600 hover:bg-green-700 shadow-green-900/20" 
                        onAction={() => handleUpdateStatus(order.id, 'SERVED')} 
                    />
                ))}
            </div>
        </div>

      </div>
    </main>
  );
}

function KitchenCard({ order, btnLabel, btnColor, onAction }: KitchenCardProps) {
    return (
        <Card className="bg-slate-800 border-slate-600 text-slate-100 shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <CardHeader className="p-3 bg-slate-900/50 flex flex-row justify-between items-start border-b border-slate-700">
                <div>
                  <CardTitle className="text-lg font-bold text-white">โต๊ะ {order.table?.name || order.tableId}</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">#{order.id}</p>
                </div>
                <div className="bg-blue-900/50 px-2 py-1 rounded text-xs text-blue-200 font-mono">
                    {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute:'2-digit' })}
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <ul className="space-y-2 mb-3">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between items-start text-sm">
                      <div className="flex-1"><span className="text-slate-200">{item.menu.nameTH}</span>{item.note && <div className="text-red-400 text-xs italic">{item.note}</div>}</div>
                      <span className="font-bold text-yellow-500 ml-2">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded-lg font-bold text-sm transition-all active:scale-95 shadow-md ${btnColor}`} onClick={onAction}>{btnLabel}</button>
            </CardContent>
        </Card>
    );
}