/**
 * @file Kitchen Socket Hook
 * @description Custom hook for managing Socket.IO connection for kitchen interface
 * 
 * This hook handles:
 * - Connect to authenticated namespace with JWT
 * - Listen to real-time events (new_order, item_status_updated, order_status_updated)
 * - Play audio notification for new orders
 * - Handle connection errors
 * - Trigger data mutations
 * 
 * @module hooks/useKitchenSocket
 * @requires react
 * @requires socket.io-client
 */

import { useEffect, useState, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_URL } from '@/lib/utils';
import { APP_CONFIG } from '@/config/constants';
import { logger } from '@/lib/logger';

interface UseKitchenSocketReturn {
  isConnected: boolean;
}

/**
 * Kitchen Socket Hook
 * 
 * Manages Socket.IO connection for kitchen interface.
 * Connects to authenticated namespace and listens to order events.
 * 
 * @param mutate - Function to refresh order data
 * @returns Socket connection state
 * 
 * @example
 * ```typescript
 * const { isConnected } = useKitchenSocket(mutate);
 * ```
 */
export function useKitchenSocket(
  mutate: () => void
): UseKitchenSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(APP_CONFIG.SOUNDS.NOTIFICATION);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!socketRef.current) {
      // Connect to authenticated namespace with JWT token
      socketRef.current = io(API_URL + '/authenticated', {
        auth: {
          token: token,
        },
      });

      socketRef.current.on('connect', () => {
        logger.debug('Kitchen connected to authenticated socket');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        logger.debug('Kitchen disconnected from authenticated socket');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        logger.error('Socket connection error:', error.message);
      });

      // Listen to new order events
      socketRef.current.on('new_order', () => {
        mutate();
        try {
          if (audioRef.current) {
            audioRef.current.play().catch((err) =>
              logger.warn('Audio play blocked (User must interact first):', err)
            );
          }
        } catch (error) {
          logger.error('Error playing sound:', error);
        }
      });

      // Listen to item status updates
      socketRef.current.on('item_status_updated', () => {
        mutate();
      });

      // Listen to order status updates
      socketRef.current.on('order_status_updated', () => {
        mutate();
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [mutate]);

  return {
    isConnected,
  };
}
