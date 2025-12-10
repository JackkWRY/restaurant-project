"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// กำหนด Type ของข้อมูลออเดอร์
interface OrderItem {
  id: number;
  quantity: number;
  menu: {
    nameTH: string;
  };
}

interface Order {
  id: number;
  tableId: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  table?: {
    name: string;
  };
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // 1. เชื่อมต่อ Socket ไปที่ Backend (Port 3000)
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("✅ Connected to Kitchen Socket");
    });

    // 2. รอฟัง Event 'new_order'
    socket.on("new_order", (newOrder: Order) => {
      console.log("🔔 New Order Received:", newOrder);
      
      // เอาออเดอร์ใหม่แทรกไว้บนสุด
      setOrders((prev) => [newOrder, ...prev]);
      
      // (Optional) เล่นเสียงเตือนตรงนี้ได้
      alert(`🔔 มีออเดอร์ใหม่! โต๊ะ ${newOrder.tableId}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="p-6 min-h-screen bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        👨‍🍳 Kitchen Display System (KDS)
        <span className="text-sm font-normal bg-green-600 px-3 py-1 rounded-full animate-pulse">
          Live
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.length === 0 ? (
          <p className="text-slate-500 col-span-full text-center mt-10">
            ยังไม่มีออเดอร์... รอลูกค้าสั่งสักครู่
          </p>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="bg-slate-800 border-slate-700 text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="bg-slate-700 p-4 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold text-yellow-400">
                    โต๊ะ {order.table?.name || order.tableId}
                  </CardTitle>
                  <p className="text-xs text-slate-400">Order #{order.id}</p>
                </div>
                <div className="bg-blue-600 px-3 py-1 rounded text-xs font-bold">
                  {new Date(order.createdAt).toLocaleTimeString('th-TH')}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center border-b border-slate-600 pb-2 last:border-0">
                      <span className="text-lg">{item.menu.nameTH}</span>
                      <span className="bg-slate-900 px-3 py-1 rounded-full text-lg font-bold">
                        x{item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
                <button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold transition-colors"
                    onClick={() => alert('ทำเสร็จแล้ว (Mockup)')}
                >
                    เสร็จสิ้น
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}