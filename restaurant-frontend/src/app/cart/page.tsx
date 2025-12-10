"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { items, addItem, removeItem, clearCart, totalPrice } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = totalPrice();

  // --- ส่วนที่แก้ไข: เปลี่ยนจาก Mockup เป็นยิง API จริง ---
  const handleConfirmOrder = async () => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);

    try {
      // 1. ส่งข้อมูลไปที่ Backend (Port 3000)
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // ส่งข้อมูล: เลขโต๊ะ (สมมติเป็น 1) และรายการอาหาร
        body: JSON.stringify({
          tableId: 1, // *Hardcode ไว้ก่อน เดี๋ยวค่อยทำให้เป็น Dynamic จาก QR
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity
          }))
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit order');
      }

      const result = await res.json();
      console.log("Order Success:", result);
      
      // 2. แจ้งเตือนสำเร็จ + ล้างตะกร้า + กลับหน้าแรก
      alert(`สั่งอาหารเรียบร้อย! ออเดอร์หมายเลข #${result.data.id}`);
      clearCart(); 
      router.push("/"); 

    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการสั่งอาหาร กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };
  // -----------------------------------------------------

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">ตะกร้าว่างเปล่า 🛒</h1>
        <p className="text-slate-500 mb-6">คุณยังไม่ได้เลือกอาหารเลย</p>
        <Link 
          href="/" 
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
        <Link href="/" className="absolute left-0 p-2 text-slate-500 hover:text-slate-900">
          ← กลับ
        </Link>
        <h1 className="flex-1 text-center text-xl font-bold text-slate-900">สรุปรายการอาหาร</h1>
      </header>

      {/* รายการอาหารในตะกร้า */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-24">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center p-3 shadow-sm border-none">
            {/* จำนวน + ปุ่มเพิ่มลด */}
            <div className="flex flex-col items-center mr-4 space-y-2">
              <button 
                onClick={() => addItem(item)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200"
              >
                +
              </button>
              <span className="font-bold text-slate-900">{item.quantity}</span>
              <button 
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200"
              >
                -
              </button>
            </div>

            {/* รายละเอียด */}
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
              <p className="text-slate-500 text-sm">ราคาต่อจาน ฿{item.price}</p>
            </div>

            {/* ราคารวมของรายการนี้ */}
            <div className="font-bold text-lg text-slate-900">
              ฿{item.price * item.quantity}
            </div>
          </Card>
        ))}
      </div>

      {/* ส่วนสรุปยอดและปุ่มยืนยัน */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-8 rounded-t-2xl shadow-lg max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4 text-xl">
          <span className="text-slate-600">ยอดสุทธิ</span>
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