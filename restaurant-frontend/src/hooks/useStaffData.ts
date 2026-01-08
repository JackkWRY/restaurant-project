/**
 * @file Staff Data Hook
 * @description Custom hook for fetching and managing staff dashboard data
 * 
 * This hook handles:
 * - Fetch all tables with status (SWR with auto-refresh)
 * - Fetch specific table order details
 * - Memoized data transformations
 * - Loading states management
 * 
 * @module hooks/useStaffData
 * @requires swr
 * @requires react
 */

import { useMemo } from 'react';
import useSWR from 'swr';
import { API_URL, fetcher } from '@/lib/utils';

/**
 * Table status data
 */
export interface TableStatus {
  id: number;
  name: string;
  isOccupied: boolean;
  totalAmount: number;
  activeOrders: number;
  isAvailable: boolean;
  isCallingStaff: boolean;
  readyOrderCount: number;
}

/**
 * Order detail item
 */
export interface OrderDetailItem {
  id: number;
  orderId: number;
  menuName: string;
  price: number;
  quantity: number;
  total: number;
  status: string;
  note?: string;
}

interface UseStaffDataReturn {
  tables: TableStatus[];
  isLoadingTables: boolean;
  tableDetails: OrderDetailItem[];
  isLoadingDetails: boolean;
  mutateTables: () => void;
  mutateDetails: () => void;
}

/**
 * Staff Data Hook
 * 
 * Fetches and manages table data and order details for staff dashboard.
 * Uses SWR for automatic caching and revalidation.
 * 
 * @param selectedTableId - ID of selected table for details (null if none selected)
 * @returns Tables data, order details, loading states, and mutate functions
 * 
 * @example
 * ```typescript
 * const { 
 *   tables, 
 *   isLoadingTables, 
 *   tableDetails, 
 *   isLoadingDetails,
 *   mutateTables,
 *   mutateDetails 
 * } = useStaffData(selectedTableId);
 * 
 * // Refresh tables data
 * mutateTables();
 * 
 * // Refresh details data
 * mutateDetails();
 * ```
 */
export function useStaffData(
  selectedTableId: number | null
): UseStaffDataReturn {
  // Fetch all tables with status
  const { 
    data: tablesData, 
    mutate: mutateTables, 
    isLoading: loadingTables 
  } = useSWR(
    `${API_URL}/api/v1/tables/status`, 
    fetcher, 
    {
      refreshInterval: 5000, // Auto-refresh every 5 seconds
      revalidateOnFocus: true,
    }
  );

  // Transform tables data
  const tables: TableStatus[] = useMemo(() => {
    return (tablesData?.status === 'success') ? tablesData.data : [];
  }, [tablesData]);

  // Fetch specific table details (only when table is selected)
  const { 
    data: detailsData, 
    mutate: mutateDetails, 
    isLoading: loadingDetails 
  } = useSWR(
    selectedTableId ? `${API_URL}/api/v1/tables/${selectedTableId}/details` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // Transform details data
  const tableDetails: OrderDetailItem[] = useMemo(() => {
    return (detailsData?.status === 'success') ? detailsData.data.items : [];
  }, [detailsData]);

  return {
    tables,
    isLoadingTables: loadingTables,
    tableDetails,
    isLoadingDetails: loadingDetails,
    mutateTables,
    mutateDetails,
  };
}
