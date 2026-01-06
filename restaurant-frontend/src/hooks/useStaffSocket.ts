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
import { APP_CONFIG } from '@/config/constants';
import { ORDER_STATUS } from '@/config/enums';
import { logger } from '@/lib/logger';

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
  
  // Audio refs - initialized in useEffect to avoid SSR issues
  const audioRefs = useRef<{
    notification: HTMLAudioElement | null;
    bell1: HTMLAudioElement | null;
    bell2: HTMLAudioElement | null;
  }>({
    notification: null,
    bell1: null,
    bell2: null,
  });

  // Initialize audio on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRefs.current = {
        notification: new Audio(APP_CONFIG.SOUNDS.NOTIFICATION),
        bell1: new Audio(APP_CONFIG.SOUNDS.BELL_1),
        bell2: new Audio(APP_CONFIG.SOUNDS.BELL_2),
      };
    }
  }, []);

  // Play audio helper
  const playAudio = useCallback((type: 'notification' | 'bell1' | 'bell2') => {
    try {
      const audio = audioRefs.current[type];
      if (audio) {
        audio.currentTime = 0; // Reset to start
        audio.play().catch((err) => {
          logger.warn(`Audio play blocked (User must interact first):`, err);
        });
      }
    } catch (error) {
      logger.error('Error playing sound:', error);
    }
  }, []);

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
      playAudio('notification');
    });

    // Event: Table Updated (e.g., customer calls staff)
    newSocket.on('table_updated', (data: TableUpdatedPayload) => {
      logger.info('Table updated:', data);
      
      // Refresh table data
      mutateTables();
      
      // Play bell sound when customer calls staff
      if (data && data.isCallingStaff) {
        playAudio('bell1');
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
        playAudio('bell2');
      }
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [mutateTables, mutateDetails, playAudio]);

  return {
    socket,
    isConnected,
    newOrderAlerts,
    newOrderIds,
    clearAlert,
    clearNewOrderBadges,
  };
}
