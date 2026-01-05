/**
 * @file Menu Item Component
 * @description Individual menu item card with cart integration
 * 
 * This component handles:
 * - Display menu item with image and details
 * - Add to cart functionality
 * - Quantity adjustment (increase/decrease)
 * - Remove from cart
 * - Sold out state visualization
 * - Recommended badge display
 * 
 * State management:
 * - Zustand cart store for cart operations
 * - Local quantity derived from cart state
 * 
 * Features:
 * - Image with fallback
 * - Sold out overlay
 * - Recommended badge
 * - Quantity controls with animations
 * - Delete on quantity = 1
 * 
 * @module components/customer/MenuItem
 * @requires react
 * @requires next/image
 * @requires store/useCartStore
 * @requires lucide-react
 * 
 * @see {@link CustomerOrder} for parent component
 * @see {@link FloatingCart} for cart display
 */

"use client";

import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/useCartStore"; 
import { Plus, Minus, Trash2 } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";

/**
 * Props for MenuItem component
 * 
 * @property {number} id - Menu item ID
 * @property {string} nameTH - Thai menu name
 * @property {number} price - Menu price
 * @property {string | null} imageUrl - Menu image URL
 * @property {boolean} isRecommended - Recommended flag
 * @property {boolean} [isAvailable=true] - Availability flag
 * @property {Dictionary} dict - Internationalization dictionary
 * 
 * @example
 * <MenuItem 
 *   id={1}
 *   nameTH="ข้าวผัด"
 *   price={50}
 *   imageUrl="/images/fried-rice.jpg"
 *   isRecommended={true}
 *   isAvailable={true}
 *   dict={dictionary}
 * />
 */
interface MenuItemProps {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
  isRecommended: boolean;
  isAvailable?: boolean;
  dict: Dictionary;
}

/**
 * Menu Item Component
 * 
 * Displays individual menu item with cart integration.
 * Handles add/remove/quantity adjustments.
 * 
 * @param props - Component props
 * @returns JSX.Element
 * 
 * @example
 * <MenuItem {...menuData} dict={dictionary} />
 */
export default function MenuItem({ id, nameTH, price, imageUrl, isRecommended, isAvailable = true, dict }: MenuItemProps) {
  // Get cart operations from store
  const { addItem, items, increaseQuantity, decreaseQuantity, removeItem } = useCartStore();
  
  // Find current item in cart to get quantity
  const currentItem = items.find((item) => item.id === id);
  const quantity = currentItem ? currentItem.quantity : 0;

  // Apply sold out styling
  const soldOutStyle = !isAvailable ? "opacity-60 grayscale pointer-events-none" : "";

  return (
    <Card className={`flex flex-row overflow-hidden shadow-sm border-slate-100 transition-all hover:shadow-md h-28 relative ${soldOutStyle}`}>
      
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

        {!isAvailable && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                 <span className="text-white font-bold border-2 border-white px-2 py-1 transform -rotate-12 rounded">
                    {dict.admin.outOfStock}
                 </span>
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
            <p className="text-xs text-orange-500 font-bold mt-0.5">★ {dict.menu.recommend}</p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-green-600">{dict.common.currency}{price}</span>

          {/* ส่วนควบคุมปุ่ม */}
          {isAvailable && (
            quantity > 0 ? (
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
                {dict.customer.addToCart}
                </button>
            )
          )}

          {!isAvailable && <span className="text-xs text-red-500 font-bold">{dict.customer.soldOut}</span>}

        </div>
      </div>
    </Card>
  );
}