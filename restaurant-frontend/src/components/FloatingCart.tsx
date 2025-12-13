"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, Trash2, Utensils } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function FloatingCart() {
  const { items, removeItem, increaseQuantity, decreaseQuantity, clearCart, totalPrice, totalItems } = useCartStore();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");

  if (items.length === 0) return null;

  const handleSendOrder = async () => {
    if (!tableId) return alert("ไม่พบเลขโต๊ะ");
    if (!confirm("ยืนยันการสั่งอาหาร?")) return;

    try {
        const res = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tableId: Number(tableId),
                items: items.map(i => ({ menuId: i.id, quantity: i.quantity, note: i.note })),
                totalPrice: totalPrice()
            })
        });

        if (res.ok) {
            alert("✅ ส่งออเดอร์เรียบร้อยแล้ว!");
            clearCart();
            setIsOpen(false);
        } else {
            alert("❌ ส่งออเดอร์ไม่สำเร็จ");
        }
    } catch (error) { console.error(error); alert("เชื่อมต่อ Server ไม่ได้"); }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white w-full p-4 rounded-xl shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-4 hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {totalItems()}
            </div>
            <span className="font-bold text-lg">ดูรายการอาหาร</span>
          </div>
          <span className="font-bold text-lg">฿{totalPrice().toLocaleString()}</span>
        </button>
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-4 animate-in fade-in backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-10">
            
            <div className="bg-slate-100 p-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Utensils size={20} className="text-red-500"/> สรุปรายการ</h2>
                <button onClick={() => setIsOpen(false)} className="bg-white p-2 rounded-full text-slate-500 hover:text-slate-800 shadow-sm"><X size={20} /></button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="mb-2"><h3 className="font-bold text-slate-800 text-lg leading-tight">{item.nameTH}</h3></div>
                        <div className="flex justify-between items-center">
                            <div className="font-bold text-slate-900 text-lg">฿{(item.price * item.quantity).toLocaleString()}</div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                                    <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 active:scale-95"><Minus size={16} /></button>
                                    <span className="w-10 text-center font-bold text-slate-800">{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item.id)} className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-md shadow-sm active:scale-95"><Plus size={16} /></button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-100"><Trash2 size={20} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-slate-50 border-t safe-area-bottom">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-bold">ยอดรวมทั้งหมด</span>
                    <span className="text-2xl font-bold text-slate-900">฿{totalPrice().toLocaleString()}</span>
                </div>
                <button onClick={handleSendOrder} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 flex justify-center items-center gap-2"><ShoppingCart size={24} /> ยืนยันการสั่งอาหาร</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}