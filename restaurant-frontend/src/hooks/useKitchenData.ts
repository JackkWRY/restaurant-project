/**
 * @file Kitchen Data Hook
 * @description Custom hook for managing kitchen data fetching and transformation
 * 
 * This hook handles:
 * - Fetch active orders with SWR
 * - Transform raw orders to kitchen items
 * - Filter out completed/cancelled items
 * - Provide loading and error states
 * 
 * @module hooks/useKitchenData
 * @requires react
 * @requires swr
 */

import { useMemo } from 'react';
import useSWR from 'swr';
import { API_URL, authFetcher } from '@/lib/utils';
import { ORDER_STATUS } from '@/config/enums';

type ItemStatus = ORDER_STATUS;

interface RawOrderItem {
  id: number;
  quantity: number;
  note?: string;
  status: ItemStatus;
  menu: {
    nameTH: string;
  };
}

interface RawOrder {
  id: number;
  table: {
    name: string;
  };
  createdAt: string;
  items: RawOrderItem[];
}

export interface KitchenItem {
  id: number;
  orderId: number;
  tableName: string;
  menuName: string;
  quantity: number;
  note?: string;
  status: ItemStatus;
  createdAt: string;
}

interface UseKitchenDataReturn {
  items: KitchenItem[];
  isLoading: boolean;
  error: unknown;
  mutate: () => void;
}

/**
 * Kitchen Data Hook
 * 
 * Fetches and transforms active orders for kitchen display.
 * Filters out completed, cancelled, and served items.
 * 
 * @returns Kitchen items, loading state, error, and mutate function
 * 
 * @example
 * ```typescript
 * const { items, isLoading, error, mutate } = useKitchenData();
 * ```
 */
export function useKitchenData(): UseKitchenDataReturn {
  const { data: swrData, error, isLoading, mutate } = useSWR(
    `${API_URL}/api/v1/orders/active`,
    authFetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  const items: KitchenItem[] = useMemo(() => {
    if (!swrData || swrData.status !== 'success') return [];

    const orders: RawOrder[] = swrData.data;
    return orders.flatMap((order) =>
      order.items
        .filter(
          (item) =>
            item.status !== ORDER_STATUS.CANCELLED &&
            item.status !== ORDER_STATUS.SERVED &&
            item.status !== ORDER_STATUS.COMPLETED
        )
        .map((item) => ({
          id: item.id,
          orderId: order.id,
          tableName: order.table.name,
          menuName: item.menu.nameTH,
          quantity: item.quantity,
          note: item.note,
          status: item.status,
          createdAt: order.createdAt,
        }))
    );
  }, [swrData]);

  return {
    items,
    isLoading,
    error,
    mutate,
  };
}
