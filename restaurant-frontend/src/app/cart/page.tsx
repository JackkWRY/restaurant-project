"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  
  // ดึง tableId มาใช้
  const { items, addItem, removeItem, deleteItem, clearCart, totalPrice, tableId } = useCartStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = totalPrice();

  // ✅ สร้างตัวแปร URL ปลายทาง (ถ้ามีโต๊ะ ให้กลับไปโต๊ะเดิม, ถ้าไม่มี ให้กลับหน้าแรก)
  const homeUrl = tableId && tableId > 0 ? `/?tableId=${tableId}` : "/";

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tableId,
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity
          }))
        }),
      });

      if (!res.ok) throw new Error('Failed to submit order');

      const result = await res.json();
      alert(`สั่งอาหารเรียบร้อย! ออเดอร์หมายเลข #${result.data.id} (โต๊ะ ${tableId})`);
      clearCart(); 
      
      // ✅ 1. แก้ไขจุด Redirect หลังสั่งเสร็จ
      router.push(homeUrl);

    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการสั่งอาหาร กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">ตะกร้าว่างเปล่า 🛒</h1>
        <p className="text-slate-500 mb-6">คุณยังไม่ได้เลือกอาหารเลย</p>
        
        {/* ✅ 2. แก้ไขปุ่มกลับ (กรณีตะกร้าว่าง) */}
        <Link 
          href={homeUrl} 
          className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold hover:bg-slate-800 transition-colors"
        >
          กลับไปเลือกอาหาร
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-md min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center mb-6 mt-2 relative">
        
        {/* ✅ 3. แก้ไขปุ่มกลับ (ลูกศรด้านบน) */}
        <Link 
          href={homeUrl}
          className="absolute left-0 p-2 text-slate-500 hover:text-slate-900"
        >
          ← กลับ
        </Link>

        <h1 className="flex-1 text-center text-xl font-bold text-slate-900">สรุปรายการอาหาร</h1>
      </header>

      {/* รายการอาหารในตะกร้า */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-24 px-1">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between p-4 shadow-none border-b last:border-none bg-white">
            
            {/* ส่วนซ้าย: รายละเอียด */}
            <div className="flex-1"> 
              <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
              <p className="text-slate-500 text-sm">ราคาต่อจาน ฿{item.price}</p>
              <div className="font-bold text-xl text-slate-900 mt-2">
                ฿{item.price * item.quantity}
              </div>
            </div>

            {/* ส่วนขวา: ปุ่มเพิ่ม/ลด และปุ่มลบ */}
            <div className="flex items-center">
              <div className="flex items-center bg-slate-100 rounded-full p-1 mr-4">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold text-slate-900 w-10 text-center">{item.quantity}</span>
                <button 
                  onClick={() => addItem(item)}
                  className="w-8 h-8 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={() => deleteItem(item.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-2"
                title="ลบรายการนี้"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-8 rounded-t-2xl shadow-lg max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4 text-xl">
          <span className="text-slate-600">ยอดสุทธิ (โต๊ะ {tableId})</span>
          <span className="font-bold text-green-600">฿{total}</span>
        </div>
        
        <button
          onClick={handleConfirmOrder}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-xl font-bold text-lg text-white shadow-lg transition-all active:scale-95 ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSubmitting ? "กำลังส่งออเดอร์..." : "ยืนยันการสั่งอาหาร"}
        </button>
      </div>
    </main>
  );
}