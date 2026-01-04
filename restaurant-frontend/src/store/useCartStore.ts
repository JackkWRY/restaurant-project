import { create } from 'zustand';

export interface CartItem {
  id: number;
  nameTH: string;
  price: number;
  quantity: number;
  note?: string;
  imageUrl?: string | null;
}

interface CartStore {
  items: CartItem[];
  tableId: number;
  
  // Actions
  setTableId: (id: number) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  updateNote: (id: number, note: string) => void;
  clearCart: () => void;
  
  // Getters
  totalPrice: () => number;
  totalItems: () => number;
}

/**
 * Global cart store hook using Zustand
 * 
 * Manages shopping cart state for customer orders including:
 * - Cart items with quantities and notes
 * - Table ID association
 * - CRUD operations for cart items
 * - Total price and items calculations
 * 
 * @example
 * ```typescript
 * const { items, addItem, totalPrice } = useCartStore();
 * addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
 * const total = totalPrice();
 * ```
 */
export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  tableId: 0,

  setTableId: (id: number) => set({ tableId: id }),

  addItem: (newItem) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === newItem.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { ...newItem, quantity: 1, note: '' }] };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    }));
  },

  increaseQuantity: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  },

  decreaseQuantity: (id) => {
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0),
    }));
  },

  updateNote: (id, note) => {
    set((state) => ({
        items: state.items.map((item) => 
            item.id === id ? { ...item, note: note } : item
        )
    }));
  },

  clearCart: () => set({ items: [] }),

  totalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  
  totalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));