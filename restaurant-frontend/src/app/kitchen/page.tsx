"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

  // ✅ ฟังก์ชันดึงออเดอร์เก่าๆ ที่ค้างอยู่ (เพิ่มใหม่)
  const fetchActiveOrders = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/orders/active');
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    // 1. เปิดมาปุ๊บ ดึงข้อมูลเก่าก่อนเลย
    fetchActiveOrders();

    // 2. แล้วค่อยเชื่อมต่อ Socket เพื่อรอออเดอร์ใหม่
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("✅ Connected to Kitchen Socket");
    });

    socket.on("new_order", (newOrder: Order) => {
      console.log("🔔 New Order Received:", newOrder);
      // เพิ่มออเดอร์ใหม่เข้าไปต่อท้าย
      setOrders((prev) => [...prev, newOrder]); 
      
      // เล่นเสียงแจ้งเตือน (Optional)
      // const audio = new Audio('/notification.mp3');
      // audio.play().catch(e => console.log(e));
    });
    
    // (Optional) ฟัง event อัปเดตสถานะด้วย เผื่อมีคนกดเสร็จสิ้นจากเครื่องอื่น จะได้หายไปพร้อมกัน
    socket.on("order_status_updated", (updatedOrder: Order) => {
       if (updatedOrder.status === 'SERVED' || updatedOrder.status === 'COMPLETED') {
           setOrders((prev) => prev.filter(o => o.id !== updatedOrder.id));
       }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update');

      // ลบออกจากหน้าจอทันที
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

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
            ไม่มีออเดอร์ค้าง... ว่างจังเลย 😴
          </p>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="bg-slate-800 border-slate-700 text-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <CardHeader className="bg-slate-700 p-4 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold text-yellow-400">
                    โต๊ะ {order.table?.name || order.tableId}
                  </CardTitle>
                  <p className="text-xs text-slate-400">Order #{order.id}</p>
                </div>
                <div className="text-right">
                    <div className="bg-blue-600 px-3 py-1 rounded text-xs font-bold mb-1">
                    {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute:'2-digit' })}
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">{order.status}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center border-b border-slate-600 pb-2 last:border-0">
                      <span className="text-lg">{item.menu.nameTH}</span>
                      <span className="bg-slate-900 px-3 py-1 rounded-full text-lg font-bold text-yellow-500">
                        x{item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button 
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all active:scale-95 shadow-lg shadow-green-900/20"
                    onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                >
                    ✅ ทำเสร็จแล้ว (เสิร์ฟ)
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}