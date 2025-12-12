"use client";

import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/useCartStore";

interface MenuItemProps {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
}

export default function MenuItem({ id, nameTH, price, imageUrl }: MenuItemProps) {
  const { addItem, items } = useCartStore();
  
  const currentItem = items.find((item) => item.id === id);
  const quantity = currentItem ? currentItem.quantity : 0;

  return (
    <Card className="flex flex-row overflow-hidden shadow-sm border-slate-100 transition-all hover:shadow-md">
      {/* รูปภาพ */}
      <div className="w-24 h-24 bg-slate-200 flex-shrink-0 relative">
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
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 line-clamp-1">
            {nameTH}
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">เมนูแนะนำ</p>
        </div>

        <div className="flex justify-between items-end mt-2">
          <span className="font-bold text-lg text-green-600">฿{price}</span>

          {/* ปุ่มกดสั่ง */}
          <button
            onClick={() => addItem({ 
              id, 
              nameTH,
              price,
              imageUrl,
              note: ""
            })}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              quantity > 0
                ? "bg-green-600 text-white"
                : "bg-slate-900 text-white hover:bg-slate-700"
            }`}
          >
            {quantity > 0 ? `ใส่แล้ว ${quantity}` : "ใส่ตะกร้า"}
          </button>
        </div>
      </div>
    </Card>
  );
}