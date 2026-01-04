"use client";

import { API_URL } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, Trash2, Utensils, MessageSquare } from "lucide-react"; 
import { useCartStore } from "@/store/useCartStore";
import type { Dictionary } from "@/locales/dictionary";

interface FloatingCartProps {
  dict: Dictionary;
}

export default function FloatingCart({ dict }: FloatingCartProps) {
  const { items, removeItem, increaseQuantity, decreaseQuantity, updateNote, clearCart, totalPrice, totalItems } = useCartStore();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");

  if (items.length === 0) return null;

  const handleSendOrder = async () => {
    if (!tableId) return alert(dict.customer.tableNotFound);
    if (!confirm(dict.customer.confirmOrderQuestion)) return;

    try {
        const res = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tableId: Number(tableId),
                items: items.map(i => ({ 
                    menuId: i.id, 
                    quantity: i.quantity, 
                    note: i.note
                })),
                totalPrice: totalPrice()
            })
        });

        if (res.ok) {
            alert(dict.customer.orderSent);
            clearCart();
            setIsOpen(false);
        } else {
            alert(dict.customer.orderFailed);
        }
    } catch (error) { logger.error(error); alert(dict.customer.serverError); }
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
            <span className="font-bold text-lg">{dict.customer.viewCart}</span>
          </div>
          <span className="font-bold text-lg">{dict.common.currency}{totalPrice().toLocaleString()}</span>
        </button>
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-4 animate-in fade-in backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-10">
            
            <div className="bg-slate-100 p-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Utensils size={20} className="text-red-500"/> {dict.customer.orderSummary}</h2>
                <button onClick={() => setIsOpen(false)} className="bg-white p-2 rounded-full text-slate-500 hover:text-slate-800 shadow-sm"><X size={20} /></button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="mb-2"><h3 className="font-bold text-slate-800 text-lg leading-tight">{item.nameTH}</h3></div>
                        
                        <div className="flex justify-between items-center mb-3">
                            <div className="font-bold text-slate-900 text-lg">{dict.common.currency}{(item.price * item.quantity).toLocaleString()}</div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                                    <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 active:scale-95"><Minus size={16} /></button>
                                    <span className="w-10 text-center font-bold text-slate-800">{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item.id)} className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-md shadow-sm active:scale-95"><Plus size={16} /></button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-100"><Trash2 size={20} /></button>
                            </div>
                        </div>

                        <div className="mt-2">
                          <div className="relative">
                              <div className="absolute top-2.5 left-3 text-slate-400">
                                  <MessageSquare size={16} />
                              </div>

                              <input 
                                  type="text" 
                                  maxLength={100} 
                                  placeholder={dict.customer.notePlaceholder} 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                                  value={item.note || ''}
                                  onChange={(e) => updateNote(item.id, e.target.value)}
                              />
                          </div>

                          <div className={`text-xs text-right mt-1 ${ (item.note?.length || 0) >= 100 ? 'text-red-500 font-bold' : 'text-slate-400' }`}>
                            {item.note?.length || 0}/100
                          </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-slate-50 border-t safe-area-bottom">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-bold">{dict.customer.total}</span>
                    <span className="text-2xl font-bold text-slate-900">{dict.common.currency}{totalPrice().toLocaleString()}</span>
                </div>
                <button onClick={handleSendOrder} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 flex justify-center items-center gap-2"><ShoppingCart size={24} /> {dict.customer.confirmOrder}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}