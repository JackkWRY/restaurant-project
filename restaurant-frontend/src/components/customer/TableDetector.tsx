/**
 * @file Table Detector Component
 * @description URL parameter detector for table ID extraction and cart initialization
 * 
 * This component handles:
 * - Extract tableId from URL query parameters
 * - Validate table ID format
 * - Initialize cart store with table ID
 * - Error logging for invalid IDs
 * 
 * State management:
 * - Updates global cart store with table ID
 * 
 * Features:
 * - Automatic detection on mount
 * - URL parameter monitoring
 * - Validation with error logging
 * 
 * @module components/customer/TableDetector
 * @requires react
 * @requires next/navigation
 * @requires store/useCartStore
 * 
 * @see {@link CustomerOrder} for parent component
 * @see {@link useCartStore} for cart state management
 */

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { logger } from "@/lib/logger";

/**
 * Table Detector Component
 * 
 * Utility component that detects table ID from URL and initializes cart.
 * Renders nothing (returns null) - purely for side effects.
 * 
 * @returns null
 * 
 * @example
 * // In CustomerOrder component
 * <TableDetector />
 * // URL: /order?tableId=5
 * // Result: Cart store initialized with tableId=5
 */
export default function TableDetector() {
  // Extract URL parameters
  const searchParams = useSearchParams();
  const { setTableId } = useCartStore();

  // Detect and validate table ID from URL on mount
  useEffect(() => {
    const idStr = searchParams.get("tableId");
    
    if (idStr) {
      const id = Number(idStr);

      if (isNaN(id)) {
        logger.error("Invalid Table ID");
      } else {
        logger.debug("Detected Table ID:", id);
        setTableId(id);
      }
    }
  }, [searchParams, setTableId]);

  return null;
}