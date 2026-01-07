/**
 * @file Audio Notification Hook
 * @description Centralized audio notification logic for sound effects
 * 
 * This hook handles:
 * - Initialize audio objects on client-side only (avoid SSR issues)
 * - Manage multiple sound types (notification, bell1, bell2)
 * - Play audio with error handling
 * - Cleanup audio resources on unmount
 * 
 * Features:
 * - Client-side only initialization (typeof window check)
 * - Reset audio to start before playing (currentTime = 0)
 * - Graceful error handling (user interaction required)
 * - Memory cleanup on unmount
 * 
 * @module hooks/useAudioNotification
 * @requires react
 * @requires @/config/constants
 * 
 * @see {@link useStaffSocket} for usage in staff dashboard
 * @see {@link useKitchenSocket} for usage in kitchen dashboard
 */

import { useRef, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '@/config/constants';
import { logger } from '@/lib/logger';

/**
 * Available sound types
 */
type SoundType = 'notification' | 'bell1' | 'bell2';

/**
 * Return type for useAudioNotification hook
 * 
 * @property {(sound: SoundType) => void} play - Play a specific sound
 * @property {() => void} playNotification - Play notification sound (shorthand)
 * @property {() => void} playBell1 - Play bell1 sound (shorthand)
 * @property {() => void} playBell2 - Play bell2 sound (shorthand)
 */
interface UseAudioNotificationReturn {
  play: (sound: SoundType) => void;
  playNotification: () => void;
  playBell1: () => void;
  playBell2: () => void;
}

/**
 * Audio Notification Hook
 * 
 * Manages audio objects for notifications and bells.
 * Handles client-side initialization and cleanup.
 * 
 * @returns Audio playback functions
 * 
 * @example
 * ```typescript
 * const { playNotification, playBell1, playBell2 } = useAudioNotification();
 * 
 * // Play notification sound
 * playNotification();
 * 
 * // Play bell sound
 * playBell1();
 * 
 * // Or use generic play function
 * play('notification');
 * ```
 */
export function useAudioNotification(): UseAudioNotificationReturn {
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

    // Cleanup on unmount
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  /**
   * Play a specific sound
   * 
   * Uses useCallback to maintain stable reference across renders.
   * This is the same pattern used in the original useStaffSocket hook.
   * 
   * @param type - Sound type to play
   */
  const play = useCallback((type: SoundType) => {
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

  return {
    play,
    playNotification: () => play('notification'),
    playBell1: () => play('bell1'),
    playBell2: () => play('bell2'),
  };
}
