// Order-related types

export interface OrderItem {
  id: number;
  orderId: number;
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  total: number;
  status: string;
  note?: string;
}

export interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  nameTH: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  note: string;
}
