import { create } from 'zustand';

// กำหนดหน้าตาของสินค้าในตะกร้า
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  // เพิ่มสินค้า
  addItem: (newItem) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === newItem.id);
      if (existingItem) {
        // ถ้ามีอยู่แล้ว ให้เพิ่มจำนวน
        return {
          items: state.items.map((item) =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      // ถ้ายังไม่มี ให้เพิ่มใหม่โดยเริ่มที่ 1
      return { items: [...state.items, { ...newItem, quantity: 1 }] };
    });
  },

  // ลบสินค้า (ลดจำนวน หรือเอาออกเลยถ้าเหลือ 0)
  removeItem: (id) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return {
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          ),
        };
      }
      return { items: state.items.filter((item) => item.id !== id) };
    });
  },

  // ล้างตะกร้า
  clearCart: () => set({ items: [] }),

  // คำนวณราคารวม
  totalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  
  // นับจำนวนจานรวม
  totalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  }
}));