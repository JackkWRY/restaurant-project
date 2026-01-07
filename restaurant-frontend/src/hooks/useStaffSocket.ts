/**
 * @file Staff Socket Hook
 * @description Custom hook for managing Socket.IO connection and real-time updates for staff dashboard
 * 
 * This hook handles:
 * - Socket.IO connection to authenticated namespace
 * - Real-time event listeners (new_order, table_updated, order_status_updated, item_status_updated)
 * - Audio notifications for new orders, staff calls, and ready items
 * - Visual alert management (new order badges, new order IDs)
 * - Connection error handling
 * 
 * @module hooks/useStaffSocket
 * @requires socket.io-client
 * @requires react
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_URL } from '@/lib/utils';
import { ORDER_STATUS } from '@/config/enums';
import { logger } from '@/lib/logger';
import { useAudioNotification } from './useAudioNotification';

interface NewOrderPayload {
  id: number;
  tableId: number;
}

interface TableUpdatedPayload {
  id: number;
  isCallingStaff: boolean;
}

interface ItemStatusUpdatedPayload {
  id: number;
  status: string;
}

interface UseStaffSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  newOrderAlerts: number[];
  newOrderIds: number[];
  clearAlert: (tableId: number) => void;
  clearNewOrderBadges: (orderIds: number[]) => void;
}

/**
 * Staff Socket Hook
 * 
 * Manages Socket.IO connection and real-time updates for staff dashboard.
 * Automatically connects on mount and disconnects on unmount.
 * 
 * @param mutateTables - Function to refresh tables data
 * @param mutateDetails - Function to refresh order details data
 * @returns Socket instance and alert management utilities
 * 
 * @example
 * ```typescript
 * const { socket, newOrderAlerts, newOrderIds, clearAlert, clearNewOrderBadges } = useStaffSocket(
 *   mutateTables,
 *   mutateDetails
 * );
 * 
 * // Clear alert when user views table details
 * clearAlert(tableId);
 * 
 * // Clear new order badges when user views details
 * clearNewOrderBadges([orderId1, orderId2]);
 * ```
 */
export function useStaffSocket(
  mutateTables: () => void,
  mutateDetails: () => void
): UseStaffSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newOrderAlerts, setNewOrderAlerts] = useState<number[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<number[]>([]);
  
  // Use audio notification hook
  const { playNotification, playBell1, playBell2 } = useAudioNotification();
  
  // Store audio functions in ref to avoid re-creating socket on every render
  const audioFunctionsRef = useRef({ playNotification, playBell1, playBell2 });
  
  // Update ref when functions change
  useEffect(() => {
    audioFunctionsRef.current = { playNotification, playBell1, playBell2 };
  }, [playNotification, playBell1, playBell2]);

  // Clear alert for specific table
  const clearAlert = useCallback((tableId: number) => {
    setNewOrderAlerts((prev) => prev.filter((id) => id !== tableId));
  }, []);

  // Clear new order badges
  const clearNewOrderBadges = useCallback((orderIds: number[]) => {
    setNewOrderIds((prev) => prev.filter((id) => !orderIds.includes(id)));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection to authenticated namespace
    const newSocket = io(API_URL + '/authenticated', {
      auth: { token }
    });

    // Connection events
    newSocket.on('connect', () => {
      logger.info('Staff socket connected');
      setSocket(newSocket); // Set socket after connection
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      logger.info('Staff socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      logger.error('Socket connection error:', error.message);
      if (error.message.includes('Authentication')) {
        newSocket.disconnect();
      }
    });

    // Event: New Order
    newSocket.on('new_order', (data: NewOrderPayload) => {
      logger.info('New order received:', data);
      
      // Refresh table data
      mutateTables();
      
      // Add visual alert badge (prevent duplicates)
      setNewOrderAlerts((prev) => {
        if (prev.includes(data.tableId)) return prev;
        return [...prev, data.tableId];
      });
      
      // Track new order IDs for "NEW" badge in details modal
      setNewOrderIds((prev) => [...prev, data.id]);
      
      // Play notification sound
      audioFunctionsRef.current.playNotification();
    });

    // Event: Table Updated (e.g., customer calls staff)
    newSocket.on('table_updated', (data: TableUpdatedPayload) => {
      logger.info('Table updated:', data);
      
      // Refresh table data
      mutateTables();
      
      // Play bell sound when customer calls staff
      if (data && data.isCallingStaff) {
        audioFunctionsRef.current.playBell1();
      }
    });

    // Event: Order Status Updated
    newSocket.on('order_status_updated', () => {
      logger.info('Order status updated');
      mutateTables();
      mutateDetails();
    });

    // Event: Item Status Updated
    newSocket.on('item_status_updated', (data: ItemStatusUpdatedPayload) => {
      logger.info('Item status updated:', data);
      
      mutateTables();
      mutateDetails();
      
      // Play notification when food is ready for pickup
      if (data && data.status === ORDER_STATUS.READY) {
        audioFunctionsRef.current.playBell2();
      }
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [mutateTables, mutateDetails]);

  return {
    socket,
    isConnected,
    newOrderAlerts,
    newOrderIds,
    clearAlert,
    clearNewOrderBadges,
  };
}
