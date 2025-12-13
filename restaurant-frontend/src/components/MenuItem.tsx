"use client";

import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/useCartStore"; 
import { Plus, Minus, Trash2 } from "lucide-react";

interface MenuItemProps {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
  isRecommended: boolean;
}

export default function MenuItem({ id, nameTH, price, imageUrl, isRecommended }: MenuItemProps) {
  const { addItem, items, increaseQuantity, decreaseQuantity, removeItem } = useCartStore();
  
  const currentItem = items.find((item) => item.id === id);
  const quantity = currentItem ? currentItem.quantity : 0;

  return (
    <Card className="flex flex-row overflow-hidden shadow-sm border-slate-100 transition-all hover:shadow-md h-28">
      
      {/* รูปภาพ */}
      <div className="w-28 h-full bg-slate-200 flex-shrink-0 relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={nameTH}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 33vw, 100px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            No Image
          </div>
        )}
      </div>

      {/* รายละเอียด */}
      <div className="flex-1 p-3 flex flex-col justify-center gap-2">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 line-clamp-1">
            {nameTH}
          </CardTitle>
          
          {isRecommended && (
            <p className="text-xs text-orange-500 font-bold mt-0.5">★ เมนูแนะนำ</p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-green-600">฿{price}</span>

          {/* ส่วนควบคุมปุ่ม */}
          {quantity > 0 ? (
            <div className="flex items-center bg-slate-50 rounded-full p-1 border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-200">
              
              <button
                onClick={() => {
                   if (quantity === 1) removeItem(id);
                   else decreaseQuantity(id);
                }}
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                  quantity === 1 
                  ? "bg-white text-red-500 hover:bg-red-50 border border-red-100" 
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
              </button>

              <span className="w-8 text-center font-bold text-sm text-slate-800">
                {quantity}
              </span>

              <button
                onClick={() => increaseQuantity(id)}
                className="w-7 h-7 flex items-center justify-center bg-white text-slate-600 rounded-full hover:bg-slate-100 border border-slate-200 active:scale-95 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem({ 
                id, 
                nameTH, 
                price,
                imageUrl,
                note: "" 
              })}
              className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              ใส่ตะกร้า
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}