// Table-related types

export interface Table {
  id: number;
  name: string;
  isAvailable: boolean;
  isCallingStaff?: boolean;
  currentOrder?: {
    id: number;
    totalAmount: number;
    itemCount: number;
  };
}

export interface TableInfo {
  id: number;
  name: string;
  isAvailable: boolean;
  isCallingStaff: boolean;
}
