"use client";

import { useCartStore } from "@/store/useCartStore";
import Link from "next/link"; // Import Link

export default function FloatingCart() {
  const { totalItems, totalPrice } = useCartStore();
  const count = totalItems();
  const total = totalPrice();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-50">
      <div className="bg-slate-900 text-white rounded-xl shadow-xl p-4 flex justify-between items-center animate-in slide-in-from-bottom-5">
        <div className="flex flex-col">
          <span className="text-sm font-light text-slate-300">ยอดรวม {count} รายการ</span>
          <span className="text-xl font-bold">฿{total}</span>
        </div>
        <Link 
          href="/cart"
          className="bg-white text-slate-900 px-5 py-2 rounded-lg font-bold hover:bg-slate-100 transition-colors"
        >
          ดูออเดอร์
        </Link>
      </div>
    </div>
  );
}