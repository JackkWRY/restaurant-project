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
  tableId: number;
  
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  deleteItem: (id: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
  setTableId: (id: number) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  tableId: 0,

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

  // ลบสินค้าออกจากตะกร้าเลย
  deleteItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id) // กรองเอา ID นั้นทิ้งไปเลย
    }));
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
  },

  // ✅ 4. ฟังก์ชันเปลี่ยนเลขโต๊ะ (ใช้ตอน Detector จับค่าจาก URL ได้)
  setTableId: (id: number) => set({ tableId: id }),
}));