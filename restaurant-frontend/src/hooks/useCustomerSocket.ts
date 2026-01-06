/**
 * @file Customer Socket Hook
 * @description Custom hook for managing Socket.IO connection for customer interface
 * 
 * This hook handles:
 * - Connect to public namespace (no authentication required)
 * - Join/leave table-specific room
 * - Listen to real-time events (table_updated, order_status_updated, item_status_updated)
 * - Trigger data mutations on events
 * 
 * @module hooks/useCustomerSocket
 * @requires react
 * @requires socket.io-client
 */

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_URL } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface UseCustomerSocketReturn {
  isConnected: boolean;
}

/**
 * Customer Socket Hook
 * 
 * Manages Socket.IO connection for customer interface.
 * Connects to public namespace and listens to table-specific events.
 * 
 * @param tableId - Table ID to join room
 * @param showHistory - Whether history modal is open (affects history mutations)
 * @param mutateTable - Function to refresh table data
 * @param mutateHistory - Function to refresh history data
 * @returns Socket connection state
 * 
 * @example
 * ```typescript
 * const { isConnected } = useCustomerSocket(
 *   tableId,
 *   showHistory,
 *   mutateTable,
 *   mutateHistory
 * );
 * ```
 */
export function useCustomerSocket(
  tableId: string | null,
  showHistory: boolean,
  mutateTable: () => void,
  mutateHistory: () => void
): UseCustomerSocketReturn {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!tableId) return;

    // Connect to public namespace (no authentication required)
    const socket: Socket = io(API_URL + '/public');

    socket.on('connect', () => {
      logger.debug('Customer connected to public socket');
      setIsConnected(true);
      
      // Join table-specific room for targeted updates
      socket.emit('join_table', Number(tableId));
    });

    socket.on('disconnect', () => {
      logger.debug('Customer disconnected from public socket');
      setIsConnected(false);
    });

    // Listen to table updates
    socket.on('table_updated', (updatedTable: { id: number }) => {
      if (String(updatedTable.id) === String(tableId)) {
        mutateTable();
      }
    });

    // Listen to order status updates
    socket.on('order_status_updated', () => {
      if (showHistory) {
        mutateHistory();
      }
    });

    // Listen to item status updates
    socket.on('item_status_updated', () => {
      if (showHistory) {
        mutateHistory();
      }
    });

    // Cleanup on unmount
    return () => {
      // Leave table room before disconnecting
      socket.emit('leave_table', Number(tableId));
      socket.disconnect();
    };
  }, [tableId, showHistory, mutateTable, mutateHistory]);

  return {
    isConnected,
  };
}
